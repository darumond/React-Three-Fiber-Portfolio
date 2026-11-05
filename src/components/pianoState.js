import { atom } from "jotai";

export const pianoActiveAtom = atom(false);
export const pianoDirectionAtom = atom({ x: 0, z: 0 });
export const pianoJumpAtom = atom(0);
export const pianoMusicEnabledAtom = atom(true);
export const pianoMusicStatusAtom = atom("off");
export const pianoReplayAtom = atom(0);
