let soundEnabled = true;

// load initial state
if (typeof window !== "undefined") {
  const saved = localStorage.getItem("soundEnabled");
  soundEnabled = saved !== "false"; // default = true
}

export function setSoundEnabled(value) {
  soundEnabled = value;
  localStorage.setItem("soundEnabled", value);
}

export function isSoundEnabled() {
  return soundEnabled;
}

export function playSound(src) {
  try {
    const audio = new Audio(src);
    audio.volume = 0.4;

    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.log("Audio play blocked:", err);
      });
    }
  } catch (err) {
    console.log("Audio error:", err);
  }
}
