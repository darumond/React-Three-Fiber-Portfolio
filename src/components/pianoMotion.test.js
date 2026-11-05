import test from "node:test";
import assert from "node:assert/strict";
import {
  createPianist, stepPianist, keyAtPosition, keyFrequency, surfaceHeightAt,
  WALK_LIMIT, RUN_SPEED, MIN_Z, MAX_Z, WHITE_KEY_COUNT, BLACK_KEY_HEIGHT, KEY_WIDTH, BLACK_KEY_AFTER,
} from "./pianoMotion.js";

const idle = { x: 0, z: 0, jump: false };
const grounded = () => ({ ...createPianist(), y: 0, landed: true, hasLanded: true });
const run = (player, input, frames, fps = 60) => {
  for (let frame = 0; frame < frames; frame++) stepPianist(player, input, 1 / fps);
};

test("the entrance fall lands before directional input takes effect", () => {
  const player = createPianist();
  stepPianist(player, { x: 1, z: -1 }, 1 / 60);
  assert.equal(player.x, 0.25);
  assert.equal(player.z, 1.68);
  assert.equal(player.hasLanded, false);
  run(player, idle, 120);
  assert.equal(player.landed, true);
  assert.equal(player.y, 0);
});

test("accelerated travel is independent of refresh rate", () => {
  const simulate = (fps) => {
    const player = grounded();
    run(player, { x: 1, z: 0 }, fps * 2, fps);
    return player.x;
  };
  assert.ok(Math.abs(simulate(30) - simulate(144)) < 1e-9);
});

test("diagonal input has the same speed as moving along one axis", () => {
  const straight = grounded(), diagonal = grounded();
  run(straight, { x: 1, z: 0 }, 24);
  run(diagonal, { x: 1, z: -1 }, 24);
  assert.ok(Math.abs(Math.hypot(diagonal.x - 0.25, diagonal.z - 1.68) - (straight.x - 0.25)) < 1e-9);
  assert.ok(Math.hypot(diagonal.velocityX, diagonal.velocityZ) <= RUN_SPEED);
});

test("movement eases in and brakes smoothly after releasing input", () => {
  const player = grounded();
  stepPianist(player, { x: 1 }, 1 / 60);
  assert.ok(player.velocityX > 0 && player.velocityX < RUN_SPEED);
  run(player, { x: 1 }, 30);
  const velocity = player.velocityX;
  stepPianist(player, idle, 1 / 60);
  assert.ok(player.velocityX > 0 && player.velocityX < velocity);
  run(player, idle, 60);
  assert.ok(player.velocityX < 1e-6);
});

test("holding jump creates one jump and lands without auto-bouncing", () => {
  const player = grounded();
  let highest = 0;
  for (let frame = 0; frame < 180; frame++) {
    stepPianist(player, { ...idle, jump: true }, 1 / 60);
    highest = Math.max(highest, player.y);
  }
  assert.ok(highest > 0.8 && highest < 1);
  assert.equal(player.landed, true);
  assert.equal(player.y, 0);
  stepPianist(player, idle, 1 / 60);
  stepPianist(player, { ...idle, jump: true }, 1 / 60);
  assert.ok(player.velocityY > 0);
});

test("all four edges hold during diagonal movement and repeated jumps", () => {
  const player = grounded();
  for (const [x, z] of [[1, 1], [-1, 1], [-1, -1], [1, -1]]) {
    const framesToCross = Math.ceil((2 * WALK_LIMIT + 2) * Math.SQRT2 / RUN_SPEED * 60);
    for (let frame = 0; frame < framesToCross; frame++) {
      stepPianist(player, { x, z, jump: frame % 70 === 0 }, 1 / 60);
      assert.ok(player.x >= -WALK_LIMIT && player.x <= WALK_LIMIT);
      assert.ok(player.z >= MIN_Z && player.z <= MAX_Z);
      assert.ok(player.y >= surfaceHeightAt(player.x, player.z) - 1e-9);
    }
    assert.equal(player.x, x * WALK_LIMIT);
    assert.equal(player.z, z > 0 ? MAX_Z : MIN_Z);
  }
});

test("raised black keys support both running and jump landings", () => {
  const player = { ...createPianist(), x: KEY_WIDTH, z: 0, y: 2 };
  run(player, idle, 120);
  assert.equal(player.y, BLACK_KEY_HEIGHT);
  assert.equal(player.landed, true);
  assert.equal(keyAtPosition(player.x, player.z), WHITE_KEY_COUNT + 26);
  stepPianist(player, { ...idle, jump: true }, 1 / 60);
  assert.ok(player.y > BLACK_KEY_HEIGHT);
  run(player, idle, 120);
  assert.equal(player.y, BLACK_KEY_HEIGHT);
});

test("jump input just before landing is buffered", () => {
  const player = { ...grounded(), y: 0.025, velocityY: -1, landed: false };
  stepPianist(player, { ...idle, jump: true }, 1 / 60);
  run(player, idle, 5);
  assert.ok(player.y > 0.1 && player.velocityY > 0);
});

test("a background frame cannot teleport the player beyond the play area", () => {
  const player = grounded();
  const start = player.x;
  stepPianist(player, { x: 1, z: 1, jump: true }, 60);
  assert.ok(player.x - start <= RUN_SPEED * 0.05);
  assert.ok(player.z <= MAX_Z);
});

test("white and black note pitches follow the piano intervals", () => {
  assert.ok(Math.abs(keyFrequency(7) / keyFrequency(0) - 2) < 1e-9);
  assert.ok(Math.abs(keyFrequency(1) / keyFrequency(0) - 2 ** (2 / 12)) < 1e-9);
  assert.ok(Math.abs(keyFrequency(WHITE_KEY_COUNT) / keyFrequency(0) - 2 ** (1 / 12)) < 1e-9);
});

test("the concert keyboard contains exactly 88 chromatic notes from A0 to C8", () => {
  const notes = [];
  for (let i = 0; i < WHITE_KEY_COUNT; i++) {
    notes.push(keyFrequency(i));
    if (i < WHITE_KEY_COUNT - 1 && BLACK_KEY_AFTER.includes(i % 7)) notes.push(keyFrequency(WHITE_KEY_COUNT + i));
  }
  assert.equal(notes.length, 88);
  assert.equal(notes[0], 27.5);
  assert.ok(Math.abs(notes.at(-1) - 4186.009044809578) < 1e-8);
  for (let i = 1; i < notes.length; i++) assert.ok(Math.abs(notes[i] / notes[i - 1] - 2 ** (1 / 12)) < 1e-12);
});
