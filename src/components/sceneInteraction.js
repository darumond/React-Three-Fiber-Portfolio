// R3F receives DOM events from the scroll container, including HTML overlays.
// A visible UI control must never activate a project behind that overlay.
export function isProjectInteractionAllowed(active, event) {
  if (!active) return false;
  const target = (event.nativeEvent ?? event.sourceEvent ?? event).target;
  return !target?.closest?.("[data-scene-ui], button, a, input, textarea, select, [role='button']");
}
