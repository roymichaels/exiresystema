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

  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";
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

  const inputName = "input.bin";
  const outputName = "output.mp3";
  await ffmpeg.writeFile(inputName, await fetchFile(videoUrl));

  await ffmpeg.exec([
    "-i", inputName,
    "-vn",
    "-acodec", "libmp3lame",
    "-b:a", "128k",
    outputName,
  ]);

  const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
  const blob = new Blob([data.buffer as ArrayBuffer], { type: "audio/mpeg" });

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
