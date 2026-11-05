import test from "node:test";
import assert from "node:assert/strict";
import { createPianoMusicController } from "./pianoMusicController.js";

function fixture() {
  let now = 0, nextFrame = 0;
  const frames = new Map(), listeners = new Map(), statuses = [];
  const audio = {
    paused: true, volume: 1, currentTime: 37, calls: 0, loads: 0,
    play() { this.calls++; this.paused = false; return this.nextPlay?.() ?? Promise.resolve(); },
    pause() { const changed = !this.paused; this.paused = true; if (changed) listeners.get("pause")?.(); },
    load() { this.loads++; this.error = null; this.paused = true; },
    addEventListener(name, listener) { listeners.set(name, listener); },
    removeEventListener(name) { listeners.delete(name); },
  };
  const music = createPianoMusicController(audio, (status) => statuses.push(status), {
    now: () => now,
    request: (callback) => { frames.set(++nextFrame, callback); return nextFrame; },
    cancel: (id) => frames.delete(id),
  });
  return { audio, music, statuses, listeners,
    advance(ms) { now += ms; const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach((callback) => callback()); },
  };
}
const settle = async () => { for (let i = 0; i < 5; i++) await Promise.resolve(); };
const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };

test("music starts only when requested and fades out without losing its position", async () => {
  const f = fixture();
  assert.equal(f.audio.calls, 0);
  f.music.setDesired(true);
  assert.equal(f.audio.calls, 1, "play is synchronous so user activation is retained");
  await settle(); f.advance(500);
  assert.equal(f.statuses.at(-1), "playing");
  assert.equal(f.audio.volume, 0.4);
  f.music.setDesired(false); f.advance(225);
  assert.ok(f.audio.volume > 0 && f.audio.volume < 0.4);
  f.advance(225);
  assert.equal(f.audio.paused, true);
  assert.equal(f.audio.currentTime, 37);
});

test("autoplay rejection stays honest and a subsequent gesture can retry", async () => {
  const f = fixture();
  f.audio.nextPlay = () => { f.audio.paused = true; return Promise.reject({ name: "NotAllowedError" }); };
  f.music.setDesired(true); await settle();
  assert.equal(f.statuses.at(-1), "blocked");
  f.audio.nextPlay = undefined;
  f.music.retry(); await settle(); f.advance(500);
  assert.equal(f.audio.calls, 2);
  assert.equal(f.statuses.at(-1), "playing");
});

test("a late media promise cannot start sound after leaving the piano", async () => {
  const f = fixture(), load = deferred();
  f.audio.nextPlay = () => load.promise;
  f.music.setDesired(true);
  f.music.setDesired(false);
  f.audio.paused = false; load.resolve(); await settle();
  assert.equal(f.audio.paused, true);
  assert.equal(f.statuses.at(-1), "off");
  assert.ok(!f.statuses.includes("playing"));
});

test("ordinary interactions cannot unmute a user-disabled soundtrack", async () => {
  const f = fixture();
  f.music.setDesired(true); await settle(); f.advance(500);
  f.music.setDesired(false); f.advance(500);
  f.music.retry(); await settle();
  assert.equal(f.audio.calls, 1);
  assert.equal(f.audio.paused, true);
  f.music.setDesired(true); await settle();
  assert.equal(f.audio.calls, 2);
});

test("rapid section changes ignore stale failures and reverse an outgoing fade", async () => {
  const f = fixture(), first = deferred(), second = deferred();
  f.audio.nextPlay = () => first.promise;
  f.music.setDesired(true); f.music.setDesired(false);
  f.audio.nextPlay = () => second.promise;
  f.music.setDesired(true);
  first.reject({ name: "AbortError" }); second.resolve(); await settle(); f.advance(500);
  assert.equal(f.statuses.at(-1), "playing");
  f.music.setDesired(false); f.advance(150); f.music.setDesired(true); f.advance(500);
  assert.equal(f.audio.paused, false);
  assert.equal(f.audio.volume, 0.4);
});

test("backgrounding and cleanup stop playback and release event handlers", async () => {
  const f = fixture();
  f.music.setDesired(true); await settle(); f.advance(500);
  f.music.setDesired(false, true);
  assert.equal(f.audio.paused, true);
  assert.equal(f.audio.volume, 0);
  f.music.dispose(); f.music.retry();
  assert.equal(f.audio.calls, 1);
  assert.equal(f.listeners.size, 0);
});

test("media errors surface a retry state instead of claiming that music is playing", async () => {
  const f = fixture();
  f.music.setDesired(true); await settle();
  f.audio.error = { code: 2 }; f.listeners.get("error")();
  assert.equal(f.statuses.at(-1), "error");
  f.music.retry(); await settle();
  assert.equal(f.audio.loads, 1);
  assert.equal(f.statuses.at(-1), "playing");
});
