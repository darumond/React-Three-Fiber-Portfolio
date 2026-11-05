import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import * as THREE from "three";

const clips = JSON.parse(fs.readFileSync(new URL("./pianoRunClips.json", import.meta.url), "utf8"));

function sampleRun() {
  const bytes = fs.readFileSync(new URL("../../public/models/64bd36ce0efdb0d632fdfe7f.glb", import.meta.url));
  const gltf = JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString());
  const bones = gltf.nodes.map((node) => {
    const bone = new THREE.Bone();
    bone.name = node.name || "";
    if (node.translation) bone.position.fromArray(node.translation);
    if (node.rotation) bone.quaternion.fromArray(node.rotation);
    return bone;
  });
  gltf.nodes.forEach((node, i) => node.children?.forEach((child) => bones[i].add(bones[child])));
  const root = new THREE.Group();
  root.rotation.x = -Math.PI / 2;
  bones.filter((bone) => !bone.parent).forEach((bone) => root.add(bone));
  const named = Object.fromEntries(bones.map((bone) => [bone.name, bone]));
  const clip = THREE.AnimationClip.parse(clips.find((candidate) => candidate.name === "Luc_Run"));
  const mixer = new THREE.AnimationMixer(root);
  mixer.clipAction(clip).play();
  const samples = [];
  for (let frame = 0; frame < 60; frame++) {
    mixer.setTime(frame / 60 * clip.duration);
    root.updateMatrixWorld(true);
    samples.push(Object.fromEntries(["LeftHand", "RightHand", "LeftFoot", "RightFoot"].map((name) =>
      [name, named[name].getWorldPosition(new THREE.Vector3())])));
  }
  return samples;
}

test("run and idle clips loop without a pose discontinuity", () => {
  for (const clip of clips) {
    for (const track of clip.tracks) {
      const width = track.type === "quaternion" ? 4 : 3;
      assert.deepEqual(track.values.slice(0, width), track.values.slice(-width), `${clip.name}: ${track.name}`);
      if (width === 4) {
        for (let i = 0; i < track.values.length; i += 4) {
          assert.ok(Math.abs(Math.hypot(...track.values.slice(i, i + 4)) - 1) < 0.000003);
        }
      }
    }
  }
});

test("both hands visibly swing beside the torso through a running cycle", () => {
  const samples = sampleRun();
  for (const hand of ["LeftHand", "RightHand"]) {
    const depths = samples.map((frame) => frame[hand].z);
    assert.ok(Math.max(...depths) - Math.min(...depths) > 0.3, `${hand} must swing, not just twist`);
    assert.ok(samples.every((frame) => hand === "LeftHand" ? frame[hand].x > 0.15 : frame[hand].x < -0.15));
  }
});

test("running feet push off, lift and return to the keys", () => {
  const samples = sampleRun();
  for (const foot of ["LeftFoot", "RightFoot"]) {
    const heights = samples.map((frame) => frame[foot].y);
    assert.ok(Math.min(...heights) > 0.08, "ankles must not sink into the keys");
    assert.ok(Math.max(...heights) - Math.min(...heights) > 0.3, "running feet must lift behind the body");
  }
  for (const foot of ["LeftFoot", "RightFoot"]) {
    assert.ok(samples.some((frame) => frame[foot].y < 0.2), "each foot must return to contact");
  }
  assert.ok(samples.some((frame) => Math.min(frame.LeftFoot.y, frame.RightFoot.y) > 0.24), "a run must include an airborne stride");
});

test("animation never moves the character root outside the physics controller", () => {
  for (const clip of clips) {
    const track = clip.tracks.find((candidate) => candidate.name === "Hips.position");
    for (let i = 0; i < track.values.length; i += 3) {
      assert.equal(track.values[i], track.values[0]);
      assert.equal(track.values[i + 1], track.values[1]);
    }
  }
});
