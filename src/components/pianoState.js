import { atom } from "jotai";
import { keyFrequency } from "./pianoMotion";

export const pianoActiveAtom = atom(false);
export const pianoDirectionAtom = atom(0);
export const pianoSoundAtom = atom(false);
export const pianoReplayAtom = atom(0);

let audioContext;

// Called only from a user gesture. Browsers keep sound silent until opted in.
export function enablePianoSound() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return Promise.resolve(false);
  audioContext ??= new AudioContext();
  return audioContext.resume().then(() => true).catch(() => false);
}

export function playPianoNote(index) {
  if (!audioContext || audioContext.state !== "running") return;
  const time = audioContext.currentTime;
  const frequency = keyFrequency(index);
  // A soft hammer attack, fundamental, and two decaying string overtones.
  [1, 2, 3].forEach((harmonic, i) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency * harmonic;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.13 / (i + 1) ** 2, time + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 1.4 / harmonic);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(time);
    oscillator.stop(time + 1.5 / harmonic);
  });
}
