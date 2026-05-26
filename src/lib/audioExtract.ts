import { Mp3Encoder } from "@breezystack/lamejs";

/**
 * Decode any audio/video file into MP3 Blob using WebAudio + lamejs.
 * Works for formats the browser can decode (mp3, wav, m4a, mp4, mov, webm in most browsers).
 */
export async function fileToMp3(
  file: File,
  onProgress?: (pct: number) => void,
  kbps = 128,
): Promise<{ blob: Blob; durationSeconds: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const AudioCtx: typeof AudioContext =
    (window as any).AudioContext || (window as any).webkitAudioContext;
  const ctx = new AudioCtx();
  let audioBuffer: AudioBuffer;
  try {
    audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
  } finally {
    ctx.close();
  }

  const sampleRate = audioBuffer.sampleRate;
  const channels = Math.min(audioBuffer.numberOfChannels, 2);
  const encoder = new Mp3Encoder(channels, sampleRate, kbps);

  const left = floatTo16(audioBuffer.getChannelData(0));
  const right =
    channels === 2 ? floatTo16(audioBuffer.getChannelData(1)) : undefined;

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
    // yield occasionally to keep UI responsive
    if (i % (blockSize * 256) === 0) await new Promise((r) => setTimeout(r));
  }
  const end = encoder.flush();
  if (end.length > 0) chunks.push(end);

  onProgress?.(100);
  return {
    blob: new Blob(chunks as BlobPart[], { type: "audio/mpeg" }),
    durationSeconds: Math.round(audioBuffer.duration),
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
