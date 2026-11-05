import test from "node:test";
import assert from "node:assert/strict";
import { easeTour, tourPhase, wheelDestination } from "./sceneTransition.js";

const gesture = () => ({ lastAt: -Infinity, consumed: false, total: 0 });

test("a wheel gesture advances exactly one section despite long momentum", () => {
  const state = gesture();
  assert.equal(wheelDestination(state, 100, 0, false, 0, 1), 1);
  for (let now = 16; now < 2500; now += 16) {
    assert.equal(wheelDestination(state, 20, now, now < 1650, 1, 1), null);
  }
  assert.equal(wheelDestination(state, 30, 2800, false, 1, 1), 1);
});

test("a fresh reverse gesture returns to the room and respects both ends", () => {
  const state = gesture();
  assert.equal(wheelDestination(state, -100, 0, false, 1, 1), 0);
  assert.equal(wheelDestination(state, -100, 300, false, 0, 1), 0);
  assert.equal(wheelDestination(state, 100, 600, false, 1, 1), 1);
});

test("trackpad noise accumulates into a deliberate gesture", () => {
  const state = gesture();
  assert.equal(wheelDestination(state, 3, 0, false, 0, 1), null);
  assert.equal(wheelDestination(state, 5, 16, false, 0, 1), null);
  assert.equal(wheelDestination(state, 7, 32, false, 0, 1), 1);
});

test("home and the final piano section have stable camera endpoints", () => {
  assert.equal(tourPhase(0).cameraBlend, 0);
  assert.equal(tourPhase(0.5).cameraBlend, 0.5);
  assert.equal(tourPhase(1).cameraBlend, 1);
  assert.equal(tourPhase(1).ready, true);
  assert.equal(tourPhase(0.4).ready, false);
  assert.equal(tourPhase(0.6).ready, false);
});

test("the camera path eases to rest and is continuous in both directions", () => {
  assert.ok(easeTour(0.001) < 1e-7);
  assert.ok(1 - easeTour(0.999) < 1e-7);
  let previous = 0;
  for (let frame = 0; frame <= 1000; frame++) {
    const value = tourPhase(frame / 1000).cameraBlend;
    assert.ok(value >= previous && value - previous < 0.003);
    assert.ok(Math.abs(value + tourPhase(1 - frame / 1000).cameraBlend - 1) < 1e-12);
    previous = value;
  }
});

test("a wheel gesture begun during menu travel cannot skip past its destination", () => {
  const state = gesture();
  assert.equal(wheelDestination(state, 100, 0, true, 1, 1), null);
  assert.equal(wheelDestination(state, 40, 100, false, 1, 1), null);
  assert.equal(wheelDestination(state, 40, 400, false, 1, 1), 1);
});

test("scrolling beyond the final section keeps the piano view active", () => {
  assert.equal(tourPhase(1.2).page, 1);
  assert.equal(tourPhase(1.2).cameraBlend, 1);
  assert.equal(tourPhase(1.2).ready, true);
  assert.equal(tourPhase(-0.2).page, 0);
});
