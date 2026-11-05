import test from "node:test";
import assert from "node:assert/strict";
import { isProjectInteractionAllowed } from "./sceneInteraction.js";

const background = { nativeEvent: { target: { closest: () => null } } };
const control = { closest: () => ({ tagName: "BUTTON" }) };

test("project cards cannot receive clicks while the piano or intro is active", () => {
  assert.equal(isProjectInteractionAllowed(false, background), false);
});
test("HTML controls and their SVG icons cannot activate a project", () => {
  assert.equal(isProjectInteractionAllowed(true, { nativeEvent: { target: control } }), false);
  assert.equal(isProjectInteractionAllowed(true, { sourceEvent: { target: control } }), false);
});
test("the piano control panel also blocks clicks in the gaps between buttons", () => {
  const panel = { closest: () => ({ dataset: { sceneUi: "" } }) };
  assert.equal(isProjectInteractionAllowed(true, { nativeEvent: { target: panel } }), false);
});
test("project card clicks still work in the settled Projects view", () => {
  assert.equal(isProjectInteractionAllowed(true, background), true);
});
