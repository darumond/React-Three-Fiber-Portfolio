import fs from "node:fs";
import * as THREE from "three";

// Offline retargeting keeps the shipped clip small and avoids loading a second
// character or performing retargeting during rendering.
const sourcePath = process.argv.slice(2).find((arg) => !arg.startsWith("--")) || "../walk-library/Animation Library[Standard]/Godot/AnimationLibrary_Godot_Standard.glb";
const targetPath = "public/models/64bd36ce0efdb0d632fdfe7f.glb";

function readRig(path) {
  const bytes = fs.readFileSync(path);
  const jsonLength = bytes.readUInt32LE(12);
  const json = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString());
  const binary = bytes.subarray(28 + jsonLength);
  const objects = json.nodes.map((node) => {
    const bone = new THREE.Bone();
    bone.name = node.name || "";
    if (node.translation) bone.position.fromArray(node.translation);
    if (node.rotation) bone.quaternion.fromArray(node.rotation);
    if (node.scale) bone.scale.fromArray(node.scale);
    return bone;
  });
  json.nodes.forEach((node, i) => node.children?.forEach((child) => objects[i].add(objects[child])));
  const root = new THREE.Group();
  objects.filter((bone) => !bone.parent).forEach((bone) => root.add(bone));
  root.updateMatrixWorld(true);
  const byName = Object.fromEntries(objects.map((bone) => [bone.name, bone]));
  const readAccessor = (index) => {
    const accessor = json.accessors[index], view = json.bufferViews[accessor.bufferView];
    if (accessor.componentType !== 5126 || view.byteStride) throw new Error("Expected packed float animation data");
    const width = { SCALAR: 1, VEC3: 3, VEC4: 4 }[accessor.type];
    return new Float32Array(binary.buffer, binary.byteOffset + (view.byteOffset || 0) + (accessor.byteOffset || 0), accessor.count * width).slice();
  };
  const clip = (name) => {
    const animation = json.animations.find((candidate) => candidate.name === name);
    if (!animation) throw new Error(`Missing animation ${name}`);
    return new THREE.AnimationClip(name, -1, animation.channels.map((channel) => {
      const sampler = animation.samplers[channel.sampler];
      const property = { rotation: "quaternion", translation: "position", scale: "scale" }[channel.target.path];
      const Track = property === "quaternion" ? THREE.QuaternionKeyframeTrack : THREE.VectorKeyframeTrack;
      return new Track(`${objects[channel.target.node].uuid}.${property}`, readAccessor(sampler.input), readAccessor(sampler.output));
    }));
  };
  return { root, objects, byName, clip };
}

const source = readRig(sourcePath);
const target = readRig(targetPath);
const names = {
  Hips: "DEF-hips", Spine: "DEF-spine.001", Spine1: "DEF-spine.002", Spine2: "DEF-spine.003",
  Neck: "DEF-neck", Head: "DEF-head",
};
for (const [side, suffix] of [["Left", "L"], ["Right", "R"]]) {
  for (const [part, sourcePart] of Object.entries({
    Shoulder: "shoulder", Arm: "upper_arm", ForeArm: "forearm", Hand: "hand",
    UpLeg: "thigh", Leg: "shin", Foot: "foot", ToeBase: "toe",
  })) names[side + part] = `DEF-${sourcePart}.${suffix}`;
  for (const [finger, sourceFinger] of [["Thumb", "thumb"], ["Index", "f_index"], ["Middle", "f_middle"], ["Ring", "f_ring"], ["Pinky", "f_pinky"]]) {
    for (let joint = 1; joint <= 3; joint++) names[`${side}Hand${finger}${joint}`] = `DEF-${sourceFinger}.0${joint}.${suffix}`;
  }
}
for (const [name, mapped] of Object.entries(names)) {
  if (!target.byName[name] || !source.byName[mapped]) throw new Error(`Unmapped bone ${name}: ${mapped}`);
}

if (process.argv.includes("--inspect")) {
  for (const [label, rig, list] of [["source", source, Object.values(names)], ["target", target, Object.keys(names)]]) {
    console.log(label, list.filter((name) => !/Hand|f_|thumb/.test(name)).map((name) => [name, rig.byName[name].getWorldPosition(new THREE.Vector3()).toArray().map((v) => +v.toFixed(3))]));
  }
  process.exit(0);
}

// The source uses a T-pose; Luc's bind pose has lowered arms. Align the
// reference arm chains before transferring rotations so the hands swing
// beside the body instead of folding through the torso.
for (const [side, suffix] of [["Left", "L"], ["Right", "R"]]) {
  for (const [part, child] of [["Arm", "ForeArm"], ["ForeArm", "Hand"]]) {
    const bone = target.byName[side + part];
    const from = target.byName[side + child].getWorldPosition(new THREE.Vector3())
      .sub(bone.getWorldPosition(new THREE.Vector3())).normalize();
    const to = source.byName[names[side + child]].getWorldPosition(new THREE.Vector3())
      .sub(source.byName[names[side + part]].getWorldPosition(new THREE.Vector3())).normalize();
    const world = new THREE.Quaternion().setFromUnitVectors(from, to)
      .multiply(bone.getWorldQuaternion(new THREE.Quaternion()));
    bone.quaternion.copy(bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(world));
    target.root.updateMatrixWorld(true);
  }
}

const sourceRest = Object.fromEntries(Object.entries(names).map(([name, mapped]) => [name, source.byName[mapped].getWorldQuaternion(new THREE.Quaternion()).invert()]));
const targetRest = Object.fromEntries(Object.keys(names).map((name) => [name, target.byName[name].getWorldQuaternion(new THREE.Quaternion())]));
const targetPositions = Object.fromEntries(Object.keys(names).map((name) => [name, target.byName[name].position.clone()]));
const hipsRest = source.byName[names.Hips].getWorldPosition(new THREE.Vector3());
const heightRatio = target.byName.Hips.position.y / hipsRest.y;
const rootCorrection = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
const samples = 61;

function retarget(sourceName, outputName) {
  const clip = source.clip(sourceName);
  const mixer = new THREE.AnimationMixer(source.root);
  mixer.clipAction(clip).play();
  const times = Array.from({ length: samples }, (_, i) => +(i / (samples - 1) * clip.duration).toFixed(6));
  const rotations = Object.fromEntries(Object.keys(names).map((name) => [name, []]));
  const positions = [];
  const desiredWorld = new Map();
  const ordered = [];
  target.root.traverse((bone) => { if (names[bone.name]) ordered.push(bone); });
  for (const time of times) {
    mixer.setTime(time >= clip.duration - 0.000001 ? 0 : time);
    source.root.updateMatrixWorld(true);
    for (const bone of ordered) {
      const name = bone.name;
      const world = source.byName[names[name]].getWorldQuaternion(new THREE.Quaternion())
        .multiply(sourceRest[name]).multiply(targetRest[name]);
      desiredWorld.set(bone, world);
      const parentWorld = desiredWorld.get(bone.parent) || bone.parent.getWorldQuaternion(new THREE.Quaternion());
      const local = parentWorld.clone().invert().multiply(world);
      if (name === "Hips") local.premultiply(rootCorrection);
      rotations[name].push(...local.toArray().map((value) => +value.toFixed(6)));
    }
    const height = source.byName[names.Hips].getWorldPosition(new THREE.Vector3()).y;
    const position = targetPositions.Hips.clone();
    position.y += (height - hipsRest.y) * heightRatio;
    position.applyQuaternion(rootCorrection);
    positions.push(...position.toArray().map((value) => +value.toFixed(6)));
  }
  mixer.stopAllAction();
  mixer.uncacheRoot(source.root);
  return {
    name: outputName, duration: +clip.duration.toFixed(6),
    tracks: [
      ...Object.entries(rotations).map(([name, values]) => ({ name: `${name}.quaternion`, type: "quaternion", times, values })),
      { name: "Hips.position", type: "vector", times, values: positions },
    ],
  };
}

const clips = [retarget("Sprint_Loop", "Luc_Run"), retarget("Idle_Loop", "Luc_PianoIdle")];
fs.writeFileSync("src/components/pianoRunClips.json", JSON.stringify(clips));
console.log(clips.map((clip) => ({ name: clip.name, duration: clip.duration, tracks: clip.tracks.length })));
