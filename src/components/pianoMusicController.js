export const PIANO_TRACK = {
  title: "Liebestraum No. 3",
  composer: "Franz Liszt",
  performer: "Martha Goldstein",
  source: "https://commons.wikimedia.org/wiki/File:Franz_Liszt_-_Liebestraum,_Ab_Major.ogg",
  license: "https://creativecommons.org/licenses/by-sa/2.0/",
  mp3: "https://upload.wikimedia.org/wikipedia/commons/transcoded/0/02/Franz_Liszt_-_Liebestraum%2C_Ab_Major.ogg/Franz_Liszt_-_Liebestraum%2C_Ab_Major.ogg.mp3",
  ogg: "https://upload.wikimedia.org/wikipedia/commons/0/02/Franz_Liszt_-_Liebestraum%2C_Ab_Major.ogg",
};

// Keep media promises and fades independent of React rerenders. In particular,
// a late autoplay result must never restart music after leaving the piano.
export function createPianoMusicController(audio, report, clock = {
  now: () => performance.now(), request: (callback) => requestAnimationFrame(callback), cancel: (id) => cancelAnimationFrame(id),
}) {
  let desired = false, disposed = false, attempt = 0, pending = -1, frame;
  audio.volume = 0;
  const cancelFade = () => { if (frame !== undefined) clock.cancel(frame); frame = undefined; };
  const fade = (target) => {
    cancelFade();
    const start = clock.now(), volume = audio.volume;
    const tick = () => {
      const t = Math.min(1, (clock.now() - start) / 450);
      audio.volume = volume + (target - volume) * t * t * (3 - 2 * t);
      if (t < 1) frame = clock.request(tick);
      else { frame = undefined; if (!desired) audio.pause(); }
    };
    frame = clock.request(tick);
  };
  const play = () => {
    if (!desired || disposed) return;
    if (pending === attempt) return;
    if (!audio.paused && !audio.error) { fade(0.4); report("playing"); return; }
    const id = ++attempt;
    pending = id;
    report("loading");
    let result;
    try {
      if (audio.error) audio.load();
      result = audio.play();
    } catch (error) { result = Promise.reject(error); }
    Promise.resolve(result).then(() => {
      if (disposed || !desired) { audio.pause(); return; }
      if (id !== attempt) return;
      pending = -1;
      fade(0.4);
      report("playing");
    }).catch((error) => {
      if (disposed || !desired || id !== attempt) return;
      pending = -1;
      report(error.name === "NotAllowedError" ? "blocked" : "error");
    });
  };
  const error = () => { if (desired && !disposed) report("error"); };
  const pause = () => { if (desired && !disposed && pending === -1) report("blocked"); };
  audio.addEventListener("error", error);
  audio.addEventListener("pause", pause);
  return {
    setDesired(value, immediate = false) {
      if (disposed) return;
      if (value) { desired = true; play(); }
      else {
        const loading = pending !== -1;
        desired = false;
        attempt++;
        pending = -1;
        report("off");
        if (immediate || loading) { cancelFade(); audio.volume = 0; audio.pause(); }
        else fade(0);
      }
    },
    retry: play,
    dispose() {
      disposed = true; desired = false; attempt++;
      cancelFade(); audio.pause();
      audio.removeEventListener("error", error);
      audio.removeEventListener("pause", pause);
    },
  };
}
