# Piano walking animation

The walking and piano-idle cycles in `src/components/pianoWalkClips.json` are
retargeted from **Universal Animation Library (Standard)** by **Quaternius**.
The library credits animator **Gonzalo Furnier** for animation contributions.

- Author and license: https://quaternius.com/packs/universalanimationlibrary.html
- Original free release: https://opengameart.org/content/universal-animation-library
- License: **CC0 1.0 Universal / Public Domain Dedication**
- License text: https://creativecommons.org/publicdomain/zero/1.0/

Only the `Walk_Loop` and `Idle_Loop` motion data is included. No replacement
character mesh or textures are shipped. The clips are adapted to Luc's existing
Ready Player Me skeleton, corrected for its lowered-arm bind pose, looped and
made stationary so the piano controller owns movement and boundaries.

To regenerate them, download and extract the author's Standard release, then run:

```sh
node scripts/build-walk.mjs "/absolute/path/to/Godot/AnimationLibrary_Godot_Standard.glb"
```

This credit applies to the new piano cycles only; the existing FBX files are
unchanged.
