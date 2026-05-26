import { Mp3Encoder } from "@breezystack/lamejs";

/**
 * Decode any audio/video file into MP3 Blob using WebAudio + lamejs.
 * Works for formats the browser can decode (mp3, wav, m4a, mp4, mov, webm in most browsers).
 *
 * Resamples to a lamejs-supported sample rate (44100Hz) to avoid encoder errors
 * when the source uses something exotic (e.g. 48000Hz video audio on some browsers).
 */
const SUPPORTED_RATES = [8000, 11025, 12000, 16000, 22050, 24000, 32000, 44100, 48000];
const TARGET_RATE = 44100;

export async function fileToMp3(
  file: File,
  onProgress?: (pct: number) => void,
  kbps = 128,
): Promise<{ blob: Blob; durationSeconds: number }> {
  const arrayBuffer = await file.arrayBuffer();

  const AudioCtx: typeof AudioContext =
    (window as any).AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) throw new Error("WebAudio not supported in this browser");

  // Decode with a throwaway AudioContext
  const decodeCtx = new AudioCtx();
  let decoded: AudioBuffer;
  try {
    decoded = await new Promise<AudioBuffer>((resolve, reject) => {
      // both promise + callback form for Safari compatibility
      const p = decodeCtx.decodeAudioData(arrayBuffer.slice(0), resolve, reject);
      if (p && typeof (p as any).then === "function") {
        (p as Promise<AudioBuffer>).then(resolve, reject);
      }
    });
  } catch (e: any) {
    decodeCtx.close();
    throw new Error(
      `הדפדפן לא הצליח לפענח את הקובץ (${e?.message || "decode failed"}). נסה קובץ אחר.`,
    );
  }
  decodeCtx.close();

  // Resample if needed
  let buffer: AudioBuffer = decoded;
  if (!SUPPORTED_RATES.includes(decoded.sampleRate)) {
    const targetLen = Math.ceil(decoded.duration * TARGET_RATE);
    const OfflineCtx: typeof OfflineAudioContext =
      (window as any).OfflineAudioContext ||
      (window as any).webkitOfflineAudioContext;
    const offline = new OfflineCtx(
      Math.min(decoded.numberOfChannels, 2),
      targetLen,
      TARGET_RATE,
    );
    const src = offline.createBufferSource();
    src.buffer = decoded;
    src.connect(offline.destination);
    src.start(0);
    buffer = await offline.startRendering();
  }

  const sampleRate = buffer.sampleRate;
  const channels = Math.min(buffer.numberOfChannels, 2);
  const encoder = new Mp3Encoder(channels, sampleRate, kbps);

  const left = floatTo16(buffer.getChannelData(0));
  const right =
    channels === 2 ? floatTo16(buffer.getChannelData(1)) : undefined;

  const blockSize = 1152;
  const chunks: Uint8Array[] = [];
  const totalSamples = left.length;

  for (let i = 0; i < totalSamples; i += blockSize) {
    const l = left.subarray(i, i + blockSize);
    const r = right ? right.subarray(i, i + blockSize) : undefined;
    const buf = r ? encoder.encodeBuffer(l, r) : encoder.encodeBuffer(l);
    if (buf.length > 0) chunks.push(buf);
    if (onProgress && i % (blockSize * 64) === 0) {
      onProgress(Math.min(99, (i / totalSamples) * 100));
    }
    if (i % (blockSize * 256) === 0) await new Promise((r) => setTimeout(r));
  }
  const end = encoder.flush();
  if (end.length > 0) chunks.push(end);

  onProgress?.(100);
  return {
    blob: new Blob(chunks as BlobPart[], { type: "audio/mpeg" }),
    durationSeconds: Math.round(buffer.duration),
  };
}

function floatTo16(input: Float32Array): Int16Array {
  const out = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}
