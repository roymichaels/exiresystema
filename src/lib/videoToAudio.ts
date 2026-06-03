/**
 * Browser-side video → MP3 extraction using ffmpeg.wasm.
 * Lazy-loaded; only used by admin tools.
 */

type FFmpegProgressPayload = { progress?: number };
type FFmpegLogPayload = { message?: string };
type FFmpegLike = {
  on(event: "progress", callback: (payload: FFmpegProgressPayload) => void): void;
  on(event: "log", callback: (payload: FFmpegLogPayload) => void): void;
  off(event: "progress", callback: (payload: FFmpegProgressPayload) => void): void;
  load(config: { coreURL: string; wasmURL: string }): Promise<unknown>;
  writeFile(path: string, data: Uint8Array): Promise<unknown>;
  exec(args: string[], timeout?: number): Promise<number>;
  readFile(path: string): Promise<Uint8Array | string>;
  deleteFile(path: string): Promise<unknown>;
  terminate(): void;
};
type WindowWithWebkitAudio = Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext };

let ffmpegInstance: FFmpegLike | null = null;

async function getFFmpeg(onLog?: (msg: string) => void) {
  if (ffmpegInstance) return ffmpegInstance;
  const { FFmpeg } = await import("@ffmpeg/ffmpeg");
  const { toBlobURL } = await import("@ffmpeg/util");

  const ffmpeg = new FFmpeg() as FFmpegLike;
  if (onLog) ffmpeg.on("log", ({ message }) => onLog(message ?? ""));

  // Vite loads ffmpeg-core as an ES module. The UMD build can fail with
  // "Importing a module script failed" in the browser worker.
  const baseURL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm";
  try {
    await withTimeout(
      ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      }),
      90_000,
      "טעינת מנוע ההמרה נתקעה. נסה שוב או העלה קובץ קצר יותר.",
    );
  } catch (error) {
    ffmpeg.terminate();
    throw error;
  }
  ffmpegInstance = ffmpeg;
  return ffmpeg;
}

export async function videoUrlToMp3(
  videoUrl: string,
  onProgress?: (pct: number) => void,
): Promise<{ blob: Blob; durationSeconds: number }> {
  const { fetchFile } = await import("@ffmpeg/util");
  onProgress?.(3);
  const source = await withTimeout(
    fetchFile(videoUrl),
    90_000,
    "טעינת הסרטון להמרה נתקעה. נסה שוב עם קובץ קצר או קטן יותר.",
  );
  return transcodeToMp3(source, "input.bin", onProgress);
}

export async function fileToMp3(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<{ blob: Blob; durationSeconds: number }> {
  const { fetchFile } = await import("@ffmpeg/util");
  const ext = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "") || "bin";
  onProgress?.(3);
  const source = await withTimeout(
    fetchFile(file),
    90_000,
    "טעינת הקובץ להמרה נתקעה. נסה שוב עם קובץ קצר או קטן יותר.",
  );
  return transcodeToMp3(source, `upload.${ext}`, onProgress);
}

async function transcodeToMp3(
  source: Uint8Array,
  sourceName: string,
  onProgress?: (pct: number) => void,
): Promise<{ blob: Blob; durationSeconds: number }> {
  onProgress?.(8);
  const ffmpeg = await getFFmpeg();
  onProgress?.(15);
  const progressHandler = onProgress
    ? ({ progress = 0 }: FFmpegProgressPayload) => onProgress(Math.min(99, Math.max(18, Math.round(progress * 100))))
    : null;

  if (progressHandler) ffmpeg.on("progress", progressHandler);

  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const inputName = `${id}-${sourceName}`;
  const outputName = `${id}-output.mp3`;

  try {
    onProgress?.(18);
    await withTimeout(
      ffmpeg.writeFile(inputName, source),
      60_000,
      "טעינת הקובץ למנוע ההמרה נתקעה. נסה קובץ קטן יותר.",
    );
    onProgress?.(22);
    const code = await withTimeout(
      ffmpeg.exec([
        "-i", inputName,
        "-vn",
        "-map", "0:a:0",
        "-acodec", "libmp3lame",
        "-b:a", "128k",
        outputName,
      ], 180_000),
      190_000,
      "ההמרה נתקעה יותר מדי זמן. נסה סרטון קצר יותר או קובץ קטן יותר.",
    );
    if (code !== 0) throw new Error(`ffmpeg exited with code ${code}`);

    const data = await ffmpeg.readFile(outputName);
    if (typeof data === "string") throw new Error("Unexpected text output from ffmpeg");
    const blob = new Blob([data.slice()], { type: "audio/mpeg" });
    const durationSeconds = await probeMp3Duration(blob);

    onProgress?.(100);
    return { blob, durationSeconds };
  } finally {
    if (progressHandler) ffmpeg.off("progress", progressHandler);
    await Promise.allSettled([ffmpeg.deleteFile(inputName), ffmpeg.deleteFile(outputName)]);
  }
}

async function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function probeMp3Duration(blob: Blob): Promise<number> {
  try {
    const ab = await blob.arrayBuffer();
    const AC = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
    if (!AC) return 0;
    const ctx = new AC();
    const decoded = await ctx.decodeAudioData(ab.slice(0));
    const duration = Math.round(decoded.duration);
    ctx.close();
    return duration;
  } catch {
    return 0;
  }
}
