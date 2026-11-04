import test from "node:test";
import assert from "node:assert/strict";
import { createPianist, stepPianist, keyAtPosition, keyFrequency, WALK_LIMIT, WHITE_KEY_COUNT } from "./pianoMotion.js";

test("the falling character lands on a key before horizontal controls take effect", () => {
  const player = createPianist();
  const startX = player.x;
  stepPianist(player, 1, 1 / 60);
  assert.equal(player.x, startX);
  assert.equal(player.landed, false);
  for (let frame = 0; frame < 120; frame++) stepPianist(player, 0, 1 / 60);
  assert.equal(player.landed, true);
  assert.equal(player.y, 0);
  assert.equal(player.velocityY, 0);
});

test("walking covers the same distance at 30 and 144 fps", () => {
  const simulate = (fps) => {
    const player = { ...createPianist(), y: 0, landed: true };
    for (let frame = 0; frame < fps * 2; frame++) stepPianist(player, 1, 1 / fps);
    return player.x;
  };
  assert.ok(Math.abs(simulate(30) - simulate(144)) < 1e-9);
});

test("held controls cannot walk the character off either end", () => {
  const player = { ...createPianist(), y: 0, landed: true };
  for (let frame = 0; frame < 1200; frame++) stepPianist(player, -1, 1 / 60);
  assert.equal(player.x, -WALK_LIMIT);
  assert.equal(keyAtPosition(player.x), 0);
  for (let frame = 0; frame < 2400; frame++) stepPianist(player, 1, 1 / 60);
  assert.equal(player.x, WALK_LIMIT);
  assert.equal(keyAtPosition(player.x), WHITE_KEY_COUNT - 1);
});

test("releasing input stops movement and a long background frame cannot teleport the player", () => {
  const player = { ...createPianist(), y: 0, landed: true };
  const start = player.x;
  stepPianist(player, 0, 1);
  assert.equal(player.x, start);
  stepPianist(player, 1, 60);
  assert.ok(player.x - start <= 0.121);
});

test("the keyboard follows white-note intervals and doubles pitch each octave", () => {
  assert.ok(Math.abs(keyFrequency(7) / keyFrequency(0) - 2) < 1e-9);
  assert.ok(Math.abs(keyFrequency(1) / keyFrequency(0) - 2 ** (2 / 12)) < 1e-9);
  assert.ok(Math.abs(keyFrequency(3) / keyFrequency(2) - 2 ** (1 / 12)) < 1e-9);
});
