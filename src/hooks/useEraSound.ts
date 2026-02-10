import { useCallback, useRef } from 'react';
import { useTheme, EraTheme } from '@/contexts/ThemeContext';

let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
};

const isSoundEnabled = (): boolean => {
  return localStorage.getItem('era_sounds_enabled') !== 'false';
};

type OscType = OscillatorType;

const playTone = (
  frequency: number,
  duration: number,
  type: OscType = 'sine',
  volume: number = 0.15
) => {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch { /* ignore audio errors */ }
};

const playArpeggio = (frequencies: number[], noteDuration: number, type: OscType = 'square', volume = 0.12) => {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime + i * noteDuration);
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + i * noteDuration + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (i + 1) * noteDuration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * noteDuration);
      osc.stop(ctx.currentTime + (i + 1) * noteDuration);
    });
  } catch { /* ignore */ }
};

const playNoise = (duration: number, volume = 0.08) => {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * volume;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();
  } catch { /* ignore */ }
};

// Era-specific sound configs
const eraSounds: Record<EraTheme, {
  click: () => void;
  success: () => void;
  error: () => void;
}> = {
  '1980s': {
    click: () => playTone(440, 0.05, 'square', 0.12),
    success: () => playArpeggio([523, 659, 784, 1047], 0.08, 'square', 0.1),
    error: () => playArpeggio([400, 300, 200], 0.12, 'square', 0.1),
  },
  '1990s': {
    click: () => playNoise(0.03, 0.06),
    success: () => playArpeggio([800, 1200, 1600], 0.06, 'sine', 0.08),
    error: () => playNoise(0.15, 0.1),
  },
  '2000s': {
    click: () => playTone(600, 0.04, 'sine', 0.1),
    success: () => playArpeggio([523, 659, 784], 0.1, 'sine', 0.1),
    error: () => playTone(220, 0.15, 'triangle', 0.12),
  },
  '2020s': {
    click: () => playTone(800, 0.06, 'sawtooth', 0.08),
    success: () => {
      if (!isSoundEnabled()) return;
      try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } catch { /* ignore */ }
    },
    error: () => playNoise(0.1, 0.12),
  },
};

export const useEraSound = () => {
  const { currentEra } = useTheme();

  const playClick = useCallback(() => {
    eraSounds[currentEra].click();
  }, [currentEra]);

  const playSuccess = useCallback(() => {
    eraSounds[currentEra].success();
  }, [currentEra]);

  const playError = useCallback(() => {
    eraSounds[currentEra].error();
  }, [currentEra]);

  return { playClick, playSuccess, playError };
};
