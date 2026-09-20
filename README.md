# Pixelora, one-page website

Portfolio site for **Aditya Gautam**, video editor and colorist. Brand: **Pixelora**.

It is ONE page. The visitor stays on the Home tab and scrolls: Home, then About, then Work, then Services, then the pink banner and footer. The nav tabs (Home, About, Work, Services) scroll to their section and the active tab changes by itself while scrolling. There are no separate pages.

Plain HTML, CSS and JavaScript. No framework, no build step.

## Run

Open `index.html`, or:

```
python3 -m http.server 8000
# open http://localhost:8000
```

## Files

```
index.html            the whole site (sections: #home #about #work #services, then banner + footer)
css/style.css         all styles, design tokens at the top
js/main.js            all behaviour, contact details in CONFIG at the top
robots.txt  sitemap.xml
assets/
  images/             photos (sticker PNG/WebP, 640px WebP, plain cutout, originals), og-image.png
  logo/               logo SVG + PNG (light, dark, pink, white), favicons, apple-touch-icon
  icons/              Dr, Ae, Ps, Ai badges, Instagram, play (SVG)
  strip/              timeline-strip-loop.svg/png (seamless loop for the hero strip), hero-dots.svg
  art/                exported artwork: work-tiles/, services/, ui-elements/
  videos/             put showreel and preview clips here (see README.txt inside)
  design-reference/   screenshots of the approved design (desktop, mobile, every section)
```

## Sections and ids

| Order | id | Content |
|---|---|---|
| 1 | `#home` | Hero: status pill, headline, two buttons, photo frame, tool badges, scrolling timeline strip |
| 2 | `#about` | "Hi, I'm Aditya", tilted "what I do" ticker, "Software I use" cards |
| 3 | `#work` | "My work", filter chips, 11-tile project grid |
| 4 | `#services` | "What I offer", six service cards |
| 5 | (none) | Pink banner "Got footage? Let's make it worth watching." and footer |

## What already works

- Sticky nav, smooth scroll, active tab follows the scroll (IntersectionObserver), outline under the nav after scrolling
- Mobile menu (under 860px) with a fixed pink "LET'S TALK" bar at the bottom
- Work filters (All, YouTube, Reels and Shorts, Ads, Color grading, Motion, Thumbnails)
- Video viewer (native `<dialog>`): the showreel button and every work tile open it. Supports an MP4 path, YouTube or Vimeo links. Closes with the X, Escape or a click outside.
- Hover preview on work tiles (desktop) when a tile has `data-preview="path.mp4"`
- Draggable before/after slider (mouse, touch, arrow keys)
- Scrolling timeline strip in the hero and scrolling ticker band in About (both pause for reduced motion)
- Scroll reveal and hero entrance animation (off for reduced motion)
- SEO: title, description, Open Graph, Twitter card, JSON-LD, robots.txt, sitemap.xml
- Accessibility: skip link, landmarks, one h1, aria labels, keyboard support, visible focus

## Pixelora Admin Studio (`admin.html`)

You can edit all text, links, and video work tiles visually without touching code:
1. Open `admin.html` in your browser (e.g. `http://localhost:8080/admin.html` or double-click `admin.html`).
2. Edit Instagram username, email, showreel video URL, social links, hero/about text, and work project cards.
3. Click **"Save Changes"** in the top-right corner.
4. Open or refresh `index.html` — your changes are immediately live!
5. You can also export/import backup JSON or reset to defaults anytime.

## Fill these in (js/main.js, CONFIG at the top) or use `admin.html`

```js
instagramUsername: 'INSTAGRAM_USERNAME'  // your Instagram username (without @)
email: 'hello@pixelora.in'
showreel: ''                             // 'assets/videos/showreel.mp4' or a YouTube / Vimeo link
social: { instagram: '', youtube: '', linkedin: '', behance: '' }
```

All Instagram, email and social links on the page are filled from this one place.

## Replace the sample work

The 11 work tiles are drawn with CSS as placeholders. For each tile in `index.html` (`<article class="tile" ...>`) set:

- `data-title` and `data-sub`: name and one-line description (also shown in the viewer)
- `data-video`: MP4 path or YouTube/Vimeo link, opened in the viewer
- `data-preview`: short muted MP4 clip played on hover
- `data-poster`: still image
- `data-cat`: filter categories (`youtube reels ads grading motion thumbnails sound`)

To use a real thumbnail image instead of the drawn art, replace the tile's `.scene`/art block with an `<img>` (keep the badge, duration and caption elements).

Before publishing, also replace `YOUR-DOMAIN` in `index.html`, `robots.txt` and `sitemap.xml`.

## Design tokens

Paper `#EEEAFB`, Ink `#1A1145`, Indigo `#3B2C8C`, Magenta `#FF2E7E`, Pink soft `#FF8FB8`, Sun `#FFC933`, Cyan `#19C3E6`, Green `#2BD67B`.
Fonts: Poppins (300, 400, 500, 700) for headings and UI, Lora (400, 500, italic) for reading text, both from Google Fonts.
Style: 2.5px ink outlines, hard offset shadows, pill buttons, big radius.

## Notes

- The photo source is 520px wide, so it is upscaled. A larger original photo will look sharper.
- Hover states (project tile highlight, "Previewing" label, progress bar) only appear on hover. In the design screenshots the first tile is shown in its hover state on purpose.
- Keep `height:auto` on images that have width and height attributes.
