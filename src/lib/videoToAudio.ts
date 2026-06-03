/**
 * Browser-side video → MP3 extraction using ffmpeg.wasm.
 * Lazy-loaded; only used by admin tools.
 */

let ffmpegInstance: any = null;

async function getFFmpeg(onLog?: (msg: string) => void) {
  if (ffmpegInstance) return ffmpegInstance;
  const { FFmpeg } = await import("@ffmpeg/ffmpeg");
  const { toBlobURL } = await import("@ffmpeg/util");

  const ffmpeg = new FFmpeg();
  if (onLog) ffmpeg.on("log", ({ message }: any) => onLog(message));

  // Vite loads ffmpeg-core as an ES module. The UMD build can fail with
  // "Importing a module script failed" in the browser worker.
  const baseURL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm";
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });
  ffmpegInstance = ffmpeg;
  return ffmpeg;
}

export async function videoUrlToMp3(
  videoUrl: string,
  onProgress?: (pct: number) => void,
): Promise<{ blob: Blob; durationSeconds: number }> {
  const { fetchFile } = await import("@ffmpeg/util");
  const source = await fetchFile(videoUrl);
  return transcodeToMp3(source, "input.bin", onProgress);
}

export async function fileToMp3(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<{ blob: Blob; durationSeconds: number }> {
  const { fetchFile } = await import("@ffmpeg/util");
  const ext = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "") || "bin";
  const source = await fetchFile(file);
  return transcodeToMp3(source, `upload.${ext}`, onProgress);
}

async function transcodeToMp3(
  source: Uint8Array,
  sourceName: string,
  onProgress?: (pct: number) => void,
): Promise<{ blob: Blob; durationSeconds: number }> {
  const ffmpeg = await getFFmpeg();
  const progressHandler = onProgress
    ? ({ progress }: any) => onProgress(Math.min(99, Math.max(0, Math.round(progress * 100))))
    : null;

  if (progressHandler) ffmpeg.on("progress", progressHandler);

  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const inputName = `${id}-${sourceName}`;
  const outputName = `${id}-output.mp3`;

  try {
    await ffmpeg.writeFile(inputName, source);
    const code = await ffmpeg.exec([
      "-i", inputName,
      "-vn",
      "-map", "0:a:0",
      "-acodec", "libmp3lame",
      "-b:a", "128k",
      outputName,
    ]);
    if (code !== 0) throw new Error(`ffmpeg exited with code ${code}`);

    const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
    const blob = new Blob([data.slice()], { type: "audio/mpeg" });
    const durationSeconds = await probeMp3Duration(blob);

    onProgress?.(100);
    return { blob, durationSeconds };
  } finally {
    if (progressHandler) ffmpeg.off("progress", progressHandler);
    await Promise.allSettled([ffmpeg.deleteFile(inputName), ffmpeg.deleteFile(outputName)]);
  }
}

async function probeMp3Duration(blob: Blob): Promise<number> {
  try {
    const ab = await blob.arrayBuffer();
    const AC: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx = new AC();
    const decoded = await ctx.decodeAudioData(ab.slice(0));
    const duration = Math.round(decoded.duration);
    ctx.close();
    return duration;
  } catch {
    return 0;
  }
}
