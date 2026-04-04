/**
 * Client-side audio mixing using Web Audio API.
 * Combines voice + SFX + music into a single shareable clip.
 */

export async function mixAudioTracks(
  voiceBase64: string,
  sfxBase64?: string,
  musicBase64?: string,
  musicVolume = 0.15,
  sfxVolume = 0.3
): Promise<Blob> {
  const audioContext = new AudioContext();

  // Decode all audio buffers
  const voiceBuffer = await decodeBase64Audio(audioContext, voiceBase64);
  const sfxBuffer = sfxBase64
    ? await decodeBase64Audio(audioContext, sfxBase64).catch(() => null)
    : null;
  const musicBuffer = musicBase64
    ? await decodeBase64Audio(audioContext, musicBase64).catch(() => null)
    : null;

  // Determine output duration (voice length + 1s tail for music fade)
  const duration = voiceBuffer.duration + (musicBuffer ? 1 : 0);

  // Create offline context for rendering
  const offlineCtx = new OfflineAudioContext(
    2, // stereo
    Math.ceil(duration * 44100),
    44100
  );

  // Voice track — full volume
  const voiceSource = offlineCtx.createBufferSource();
  voiceSource.buffer = voiceBuffer;
  const voiceGain = offlineCtx.createGain();
  voiceGain.gain.value = 1.0;
  voiceSource.connect(voiceGain);
  voiceGain.connect(offlineCtx.destination);
  voiceSource.start(0);

  // SFX track — fade in at start
  if (sfxBuffer) {
    const sfxSource = offlineCtx.createBufferSource();
    sfxSource.buffer = sfxBuffer;
    const sfxGain = offlineCtx.createGain();
    sfxGain.gain.setValueAtTime(0, 0);
    sfxGain.gain.linearRampToValueAtTime(sfxVolume, 0.5);
    sfxGain.gain.setValueAtTime(sfxVolume, sfxBuffer.duration - 0.5);
    sfxGain.gain.linearRampToValueAtTime(0, sfxBuffer.duration);
    sfxSource.connect(sfxGain);
    sfxGain.connect(offlineCtx.destination);
    sfxSource.start(0);
  }

  // Music track — low volume background
  if (musicBuffer) {
    const musicSource = offlineCtx.createBufferSource();
    musicSource.buffer = musicBuffer;
    const musicGain = offlineCtx.createGain();
    musicGain.gain.setValueAtTime(0, 0);
    musicGain.gain.linearRampToValueAtTime(musicVolume, 1);
    musicGain.gain.setValueAtTime(musicVolume, duration - 1);
    musicGain.gain.linearRampToValueAtTime(0, duration);
    musicSource.connect(musicGain);
    musicGain.connect(offlineCtx.destination);
    musicSource.start(0);
  }

  // Render and convert to WAV blob
  const renderedBuffer = await offlineCtx.startRendering();
  return audioBufferToWav(renderedBuffer);
}

async function decodeBase64Audio(
  ctx: BaseAudioContext,
  base64: string
): Promise<AudioBuffer> {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return ctx.decodeAudioData(bytes.buffer);
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = length * blockAlign;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  // WAV header
  writeString(view, 0, "RIFF");
  view.setUint32(4, totalSize - 8, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  // Interleave channels
  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channels.push(buffer.getChannelData(ch));
  }

  let offset = headerSize;
  for (let i = 0; i < length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      view.setInt16(offset, sample * 0x7fff, true);
      offset += bytesPerSample;
    }
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
