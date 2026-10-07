const CAPTION_PREFIX = "elliottvideos:caption:";

const PLAY_ICON = (size) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M${size * 0.28} ${size * 0.11}l${size * 0.56} ${size * 0.39}-${size * 0.56} ${size * 0.39}V${size * 0.11}z" fill="currentColor"/></svg>`;
const PAUSE_ICON = (size) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="${size * 0.26}" y="${size * 0.16}" width="${size * 0.16}" height="${size * 0.68}" fill="currentColor"/><rect x="${size * 0.58}" y="${size * 0.16}" width="${size * 0.16}" height="${size * 0.68}" fill="currentColor"/></svg>`;

/* ---------- Local authoring mode: edit toggle + file slates only off the live domain ---------- */
const isLocal =
  location.protocol === "file:" || ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);
if (isLocal) document.body.classList.add("is-local");

/* ---------- Nav: solid background once scrolled past the top ---------- */
const nav = document.querySelector(".nav");
const updateNav = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
window.addEventListener("scroll", updateNav, { passive: true });
updateNav();

/* ---------- Hero reel: hide if the file isn't there yet ---------- */
const reel = document.querySelector(".hero__reel");
if (reel) {
  const hideReel = () => reel.closest(".hero").classList.add("no-reel");
  reel.addEventListener("error", hideReel);
  if (reel.error || reel.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) hideReel();
}

/* ---------- Work cards: placeholder detection + play/pause (one at a time) ---------- */
const videoCards = document.querySelectorAll(".card--video");

videoCards.forEach((card) => {
  const frame = card.querySelector(".card__frame");
  const video = card.querySelector(".card__video");
  const btn = card.querySelector(".card__play");

  const markMissing = () => card.classList.add("is-empty");
  video.addEventListener("error", markMissing);
  if (video.error || video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) markMissing();

  video.addEventListener("play", () => {
    // pause any other piece that's playing
    videoCards.forEach((other) => {
      const v = other.querySelector(".card__video");
      if (v !== video && !v.paused) v.pause();
    });
    card.classList.add("is-playing");
    btn.innerHTML = PAUSE_ICON(18);
    btn.setAttribute("aria-label", "Pause");
  });
  ["pause", "ended"].forEach((evt) =>
    video.addEventListener(evt, () => {
      card.classList.remove("is-playing");
      btn.innerHTML = PLAY_ICON(18);
      btn.setAttribute("aria-label", "Play");
    })
  );

  frame.addEventListener("click", () => {
    if (card.classList.contains("is-empty")) return;
    if (video.paused) video.play();
    else video.pause();
  });
});

/* ---------- Editable text: saved to this browser only (local authoring) ---------- */
const editables = document.querySelectorAll("[data-caption-key]");

if (isLocal) {
  editables.forEach((el) => {
    let saved = null;
    try { saved = localStorage.getItem(CAPTION_PREFIX + el.dataset.captionKey); } catch {}
    if (saved !== null) el.textContent = saved;

    el.addEventListener("input", () => {
      try { localStorage.setItem(CAPTION_PREFIX + el.dataset.captionKey, el.textContent.trim()); } catch {}
    });

    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        el.blur();
      }
    });
  });
}

const editToggle = document.getElementById("captionEditToggle");
editToggle.addEventListener("click", () => {
  const editing = document.body.classList.toggle("is-editing");
  editToggle.setAttribute("aria-pressed", String(editing));
  editToggle.textContent = editing ? "Done editing" : "Edit text";
  editables.forEach((el) => el.setAttribute("contenteditable", editing ? "true" : "false"));
});
