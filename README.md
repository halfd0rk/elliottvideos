# Elliott Videos — www.elliottvideos.com

Static site, no build step, hosted on GitHub Pages. Adapted from
`krea-portfolio`. Sections: hero (with background reel) → **Work** (video)
→ **Services** → **How it works** → contact.

## Media to drop in

Every video slot shows a striped placeholder until its file exists — no code
changes needed once the file lands at the right path.

```
assets/reel/hero.mp4          muted looping background behind the hero (keep it short, <10 MB)
assets/reel/hero-poster.jpg   still shown before the reel loads
assets/work/01.mp4            feature (full width, 16:9) — the showreel
assets/work/02–04.mp4         shorts (vertical 9:16, three across)
assets/work/05–06.mp4         half width, 16:9
assets/work/0X-poster.jpg     optional thumbnail for each piece
assets/og.jpg                 1200×630 link-preview image
```

Size classes on `<article class="card card--video ...">`: `card--feature`,
`card--half`, `card--short`. Reorder or add pieces by copying an article
block and keeping the paths/`data-caption-key` in sync.

**Keep files small.** GitHub rejects files over 100 MB and Pages sites should
stay under 1 GB. Export web versions (H.264, ~1080p, CRF 23–26, `-movflags
+faststart`). For long pieces, consider a YouTube embed instead of an mp4.

## Editing text

Opened locally (`localhost` or `file://`), an **Edit text** button appears in
the nav. Any element with `data-caption-key` (captions, service copy, prices,
steps) becomes editable and saves to your browser only. Copy the final wording
into `index.html` before committing. On the live domain the button and file
slates are hidden.

Preview locally: `python -m http.server 8123` in this folder, then open
http://localhost:8123.

## Domain

`CNAME` holds `www.elliottvideos.com`. DNS (at Squarespace Domains):

| Type  | Host | Value |
|-------|------|-------|
| CNAME | www  | halfd0rk.github.io |
| A     | @    | 185.199.108.153 |
| A     | @    | 185.199.109.153 |
| A     | @    | 185.199.110.153 |
| A     | @    | 185.199.111.153 |
| AAAA  | @    | 2606:50c0:8000::153 |
| AAAA  | @    | 2606:50c0:8001::153 |
| AAAA  | @    | 2606:50c0:8002::153 |
| AAAA  | @    | 2606:50c0:8003::153 |

The apex records make `elliottvideos.com` redirect to `www`. Remove the
Squarespace default records for `@` and `www` first. Then turn on
**Enforce HTTPS** in the repo's Pages settings once the certificate is issued.
