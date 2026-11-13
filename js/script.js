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

  addScrubBar(card, frame, video);
});

/* ---------- Scrub bar: play/pause, seek, time (appears once a video has started) ---------- */
function formatTime(s) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function addScrubBar(card, frame, video) {
  const bar = document.createElement("div");
  bar.className = "card__controls";
  bar.innerHTML = `
    <button class="card__ctrl-play" type="button" aria-label="Play">${PLAY_ICON(14)}</button>
    <input class="card__seek" type="range" min="0" max="1000" step="1" value="0" aria-label="Seek">
    <span class="card__time"><span class="card__time-now">0:00</span> / <span class="card__time-total">0:00</span></span>`;
  frame.appendChild(bar);

  const playBtn = bar.querySelector(".card__ctrl-play");
  const seek = bar.querySelector(".card__seek");
  const now = bar.querySelector(".card__time-now");
  const total = bar.querySelector(".card__time-total");
  let dragging = false;

  // Clicks on the bar shouldn't also toggle play via the frame
  bar.addEventListener("click", (e) => e.stopPropagation());

  playBtn.addEventListener("click", () => (video.paused ? video.play() : video.pause()));

  const paint = () => {
    const d = video.duration;
    const p = d ? video.currentTime / d : 0;
    if (!dragging) seek.value = Math.round(p * 1000);
    seek.style.setProperty("--p", `${(seek.value / 10).toFixed(1)}%`);
    now.textContent = formatTime(video.currentTime);
    total.textContent = formatTime(d);
  };

  const seekTo = () => {
    if (video.duration) video.currentTime = (seek.value / 1000) * video.duration;
    paint();
  };
  seek.addEventListener("input", () => { dragging = true; seekTo(); });
  seek.addEventListener("change", () => { dragging = false; seekTo(); });
  seek.addEventListener("pointerup", () => { dragging = false; });

  video.addEventListener("loadedmetadata", paint);
  video.addEventListener("timeupdate", paint);
  video.addEventListener("seeked", paint);
  video.addEventListener("play", () => {
    card.classList.add("is-started");
    playBtn.innerHTML = PAUSE_ICON(14);
    playBtn.setAttribute("aria-label", "Pause");
  });
  ["pause", "ended"].forEach((evt) =>
    video.addEventListener(evt, () => {
      playBtn.innerHTML = PLAY_ICON(14);
      playBtn.setAttribute("aria-label", "Play");
    })
  );
  paint();
}

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

/* ---------- Contact form: send without leaving the page (falls back to a normal POST) ---------- */
const contactForm = document.getElementById("contactForm");
if (contactForm && window.fetch) {
  const status = contactForm.querySelector(".contact-form__status");
  const submit = contactForm.querySelector(".contact-form__submit");
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (contactForm.elements._honey.value) return; // bot trap
    submit.disabled = true;
    submit.textContent = "Sending…";
    status.className = "contact-form__status";
    status.textContent = "";
    try {
      const res = await fetch(contactForm.action.replace("formsubmit.co/", "formsubmit.co/ajax/"), {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(contactForm),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && String(data.success) !== "false") {
        contactForm.reset();
        status.classList.add("is-ok");
        status.textContent = "Thanks! Your message is on its way. I'll reply within a day.";
        return;
      }
      if (/activat/i.test(data.message || "")) {
        status.classList.add("is-error");
        status.textContent = "This form is waiting to be activated. Please try again shortly, or email elliottlacour@gmail.com.";
        return;
      }
      throw new Error(data.message || "Send failed");
    } catch (err) {
      // AJAX failed (blocked request, network, etc.): fall back to a normal form post.
      HTMLFormElement.prototype.submit.call(contactForm);
      return;
    } finally {
      submit.disabled = false;
      submit.textContent = "Send message";
    }
  });
}
