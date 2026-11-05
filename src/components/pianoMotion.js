export const WHITE_KEY_COUNT = 28;
export const KEY_WIDTH = 0.5;
export const PIANO_WIDTH = WHITE_KEY_COUNT * KEY_WIDTH;
export const WALK_LIMIT = PIANO_WIDTH / 2 - KEY_WIDTH / 2;
export const WALK_SPEED = 0.8;
export const MIN_Z = -1.15;
export const MAX_Z = 1.97;
export const BLACK_KEY_HEIGHT = 0.3;
export const BLACK_KEY_AFTER = [0, 1, 3, 4, 5];

export const createPianist = () => ({
  x: 0.25, z: 1.68, y: 6,
  velocityX: 0, velocityZ: 0, velocityY: 0,
  landed: false, hasLanded: false, distance: 0,
  jumpHeld: false, jumpBuffer: 0, coyote: 0,
});

export function blackKeyAtPosition(x, z) {
  if (z < -1.705 || z > 0.545) return -1;
  const index = Math.round(x / KEY_WIDTH + (WHITE_KEY_COUNT - 2) / 2);
  const center = (index - (WHITE_KEY_COUNT - 2) / 2) * KEY_WIDTH;
  return index >= 0 && index < WHITE_KEY_COUNT - 1 &&
    BLACK_KEY_AFTER.includes(index % 7) && Math.abs(x - center) <= 0.145 ? index : -1;
}

export function surfaceHeightAt(x, z) {
  return blackKeyAtPosition(x, z) >= 0 ? BLACK_KEY_HEIGHT : 0;
}

export function keyAtPosition(x, z = 1.68) {
  const black = blackKeyAtPosition(x, z);
  if (black >= 0) return WHITE_KEY_COUNT + black;
  return Math.max(0, Math.min(WHITE_KEY_COUNT - 1,
    Math.floor((x + PIANO_WIDTH / 2) / KEY_WIDTH)));
}

// Integrate exponential acceleration analytically so input feels the same at
// different refresh rates. Small physics steps keep jumps on the key surfaces.
export function stepPianist(player, input, delta) {
  const dt = Math.min(Math.max(delta, 0), 0.05);
  const length = Math.hypot(input.x || 0, input.z || 0);
  const divisor = Math.max(1, length);
  const targetX = (input.x || 0) / divisor * WALK_SPEED;
  const targetZ = (input.z || 0) / divisor * WALK_SPEED;
  if (input.jump && !player.jumpHeld && player.hasLanded) player.jumpBuffer = 0.13;
  player.jumpHeld = !!input.jump;
  const steps = Math.max(1, Math.ceil(dt * 120));
  const step = dt / steps;
  for (let i = 0; i < steps; i++) {
    if (player.landed) player.coyote = 0.1;
    else player.coyote = Math.max(0, player.coyote - step);
    if (player.jumpBuffer > 0 && player.coyote > 0) {
      player.velocityY = 4.7;
      player.landed = false;
      player.coyote = 0;
      player.jumpBuffer = 0;
    }
    player.jumpBuffer = Math.max(0, player.jumpBuffer - step);
    if (player.hasLanded) {
      const rate = length ? (player.landed ? 14 : 8) : 20;
      const decay = Math.exp(-rate * step);
      const oldX = player.x, oldZ = player.z;
      player.x += targetX * step + (player.velocityX - targetX) * (1 - decay) / rate;
      player.z += targetZ * step + (player.velocityZ - targetZ) * (1 - decay) / rate;
      player.velocityX = targetX + (player.velocityX - targetX) * decay;
      player.velocityZ = targetZ + (player.velocityZ - targetZ) * decay;
      player.x = Math.max(-WALK_LIMIT, Math.min(WALK_LIMIT, player.x));
      player.z = Math.max(MIN_Z, Math.min(MAX_Z, player.z));
      if (Math.abs(player.x) === WALK_LIMIT) player.velocityX = 0;
      if (player.z === MIN_Z || player.z === MAX_Z) player.velocityZ = 0;
      player.distance += Math.hypot(player.x - oldX, player.z - oldZ);
    }
    const floor = surfaceHeightAt(player.x, player.z);
    // The shallow raised notes are walkable steps; jumps also land on them.
    if (player.landed && floor >= player.y) player.y = floor;
    if (player.y > floor + 0.001 || player.velocityY > 0) player.landed = false;
    if (!player.landed) {
      player.y += player.velocityY * step - 6 * step * step;
      player.velocityY -= 12 * step;
      if (player.y <= floor && player.velocityY <= 0) {
        player.y = floor;
        player.velocityY = 0;
        player.landed = true;
        player.hasLanded = true;
      } else if (player.y < floor) player.y = floor;
    }
  }
}

export function keyFrequency(index) {
  const black = index >= WHITE_KEY_COUNT;
  const white = black ? index - WHITE_KEY_COUNT : index;
  const semitones = [0, 2, 4, 5, 7, 9, 11];
  const midi = 36 + Math.floor(white / 7) * 12 + semitones[white % 7] + (black ? 1 : 0);
  return 440 * 2 ** ((midi - 69) / 12);
}
