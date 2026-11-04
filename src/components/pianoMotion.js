export const WHITE_KEY_COUNT = 28;
export const KEY_WIDTH = 0.5;
export const PIANO_WIDTH = WHITE_KEY_COUNT * KEY_WIDTH;
export const WALK_LIMIT = PIANO_WIDTH / 2 - KEY_WIDTH / 2;
export const WALK_SPEED = 2.4;

export const createPianist = () => ({
  x: 0.25,
  y: 6,
  velocityY: 0,
  landed: false,
  distance: 0,
});

// Local piano coordinates: the white-key surface is y = 0.
export function stepPianist(player, direction, delta) {
  const dt = Math.min(Math.max(delta, 0), 0.05);
  if (!player.landed) {
    player.y += player.velocityY * dt - 0.5 * 12 * dt * dt;
    player.velocityY -= 12 * dt;
    if (player.y <= 0) {
      player.y = 0;
      player.velocityY = 0;
      player.landed = true;
    }
    return;
  }
  const previousX = player.x;
  player.x = Math.max(-WALK_LIMIT, Math.min(WALK_LIMIT,
    player.x + Math.sign(direction) * WALK_SPEED * dt));
  player.distance += Math.abs(player.x - previousX);
}

export function keyAtPosition(x) {
  return Math.max(0, Math.min(WHITE_KEY_COUNT - 1,
    Math.floor((x + PIANO_WIDTH / 2) / KEY_WIDTH)));
}

export function keyFrequency(index) {
  const semitones = [0, 2, 4, 5, 7, 9, 11];
  const midi = 36 + Math.floor(index / 7) * 12 + semitones[index % 7];
  return 440 * 2 ** ((midi - 69) / 12);
}
