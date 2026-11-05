export const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
export const easeTour = (value) => {
  const t = clamp(value);
  return t * t * t * (t * (t * 6 - 15) + 10);
};

export function tourPhase(offset, pages = 3) {
  const page = clamp(offset * (pages - 1), 0, pages - 1);
  const zoom = easeTour(page);
  const departure = easeTour(page - 1);
  return { page, zoom, departure, cameraBlend: zoom * (1 - departure), ready: Math.abs(page - 1) < 0.012 };
}

// Momentum belongs to the gesture that started it, even if the camera move
// finishes before the last trackpad events arrive.
export function wheelDestination(gesture, delta, now, animating, section, lastSection) {
  if (now - gesture.lastAt > 220 && !animating) {
    gesture.consumed = false;
    gesture.total = 0;
  }
  gesture.lastAt = now;
  if (animating) { gesture.consumed = true; return null; }
  if (gesture.consumed) return null;
  gesture.total += delta;
  if (Math.abs(gesture.total) < 14) return null;
  gesture.consumed = true;
  return clamp(section + Math.sign(gesture.total), 0, lastSection);
}
