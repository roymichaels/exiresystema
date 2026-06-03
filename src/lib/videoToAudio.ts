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
  const ffmpeg = await getFFmpeg();

  if (onProgress) {
    ffmpeg.on("progress", ({ progress }: any) => {
      onProgress(Math.min(99, Math.round(progress * 100)));
    });
  }

  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const inputName = `input-${id}.bin`;
  const outputName = `output-${id}.mp3`;
  await ffmpeg.writeFile(inputName, await fetchFile(videoUrl));

  await ffmpeg.exec([
    "-i", inputName,
    "-vn",
    "-acodec", "libmp3lame",
    "-b:a", "128k",
    outputName,
  ]);

  const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
  const blob = new Blob([data.slice().buffer], { type: "audio/mpeg" });

  await Promise.allSettled([ffmpeg.deleteFile(inputName), ffmpeg.deleteFile(outputName)]);

  // Probe duration via WebAudio (best effort)
  let durationSeconds = 0;
  try {
    const ab = await blob.arrayBuffer();
    const AC: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx = new AC();
    const decoded = await ctx.decodeAudioData(ab.slice(0));
    durationSeconds = Math.round(decoded.duration);
    ctx.close();
  } catch {}

  onProgress?.(100);
  return { blob, durationSeconds };
}

export async function fileToMp3(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<{ blob: Blob; durationSeconds: number }> {
  const { fetchFile } = await import("@ffmpeg/util");
  const ffmpeg = await getFFmpeg();

  if (onProgress) {
    ffmpeg.on("progress", ({ progress }: any) => {
      onProgress(Math.min(99, Math.max(0, Math.round(progress * 100))));
    });
  }

  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const ext = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "") || "bin";
  const inputName = `upload-${id}.${ext}`;
  const outputName = `upload-${id}.mp3`;

  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec([
    "-i", inputName,
    "-vn",
    "-acodec", "libmp3lame",
    "-b:a", "128k",
    outputName,
  ]);

  const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
  const blob = new Blob([data.slice().buffer], { type: "audio/mpeg" });
  await Promise.allSettled([ffmpeg.deleteFile(inputName), ffmpeg.deleteFile(outputName)]);

  const durationSeconds = await probeMp3Duration(blob);
  onProgress?.(100);
  return { blob, durationSeconds };
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
