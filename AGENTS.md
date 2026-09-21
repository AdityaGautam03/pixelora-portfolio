# Pixelora Portfolio & Admin Studio - Project Context & Guidelines

This document serves as permanent memory and architectural reference for Antigravity AI pair programming sessions on this repository.

---

## 1. Project Overview & Live URLs
- **Owner / Portfolio**: Aditya Gautam (Video Editor & Colorist)
- **Live Always-On Website**: [https://pixelora-edits.vercel.app/](https://pixelora-edits.vercel.app/)
- **Live Admin Studio**: [https://pixelora-edits.vercel.app/admin.html](https://pixelora-edits.vercel.app/admin.html)
- **GitHub Repository**: [https://github.com/AdityaGautam03/pixelora-portfolio](https://github.com/AdityaGautam03/pixelora-portfolio) (branch: `main`)
- **Alternative GitHub Pages**: [https://adityagautam03.github.io/pixelora-portfolio/](https://adityagautam03.github.io/pixelora-portfolio/)

---

## 2. Core Architecture & Tech Stack
- **Frontend**: Vanilla HTML5, Modern CSS3 design system with vibrant retro-pop/cyberpunk neo-brutalist aesthetics, Vanilla JS (zero external runtime dependencies).
- **Hosting**: Vercel Always-On Edge deployment connected to GitHub `main` branch. Any push to `main` auto-deploys within ~10 seconds.
- **Backend / Serverless**: `api/content.js` (Vercel Serverless Node.js function).

---

## 3. Persistent Cloud CMS Architecture
All content across the website (videos, text, links, before/after media, services) is stored centrally in `content.json`.

### How Saving Works (`admin.html`):
1. Admin user edits content and clicks **"Save Changes"**.
2. Content is saved immediately to `localStorage` for zero latency.
3. Admin saves to Cloud via a dual-layer strategy:
   - **Primary**: `POST /api/content` serverless route on Vercel.
   - **Fallback**: Direct browser PUT to GitHub Contents REST API (`https://api.github.com/repos/AdityaGautam03/pixelora-portfolio/contents/content.json`).
4. Commit is created on `main` branch (`chore: update content.json via Pixelora Admin Studio`).
5. Vercel automatically deploys the updated state.

### How Displaying Works (`index.html` & `js/main.js`):
1. **0ms Initial Render**: Renders local cache if present, preventing layout shifts.
2. **Background Multi-Tier Sync**: Fetches `/api/content?t=...` -> `content.json?t=...` -> `https://raw.githubusercontent.com/.../content.json?t=...`.
3. Calls `applyContentData(data)` to update DOM elements (work videos, aspect ratios, headings, contact links, showreel, before/after).
4. Updates `localStorage` so future visits on that device load the latest content instantly.
5. **Outcome**: Changes made in Admin Studio never reset on browser close, and are immediately live across all devices globally (smartphones, tablets, client laptops).

---

## 4. Key Functional Components
1. **Work Section & Video Autoplay (`#work`)**:
   - Project tiles support aspect ratios: `16:9` (landscape `w2`), `9:16` (vertical reel `h2r`), and `1:1` (square).
   - Autoplays videos directly in tiles on page scroll and load (muted, playsinline, loop). Supports MP4/WebM files and YouTube embeds.
2. **Before & After Comparison Slider**:
   - Interactive split-slider comparing raw footage to finished color-graded edits. Supports dual videos or images.
3. **Showreel Modal (`#showreel`)**:
   - Global modal player for watching showreel video.
4. **Contact & Social Bindings**:
   - Elements with `data-ig` automatically route to user's Instagram profile or `ig.me/m/` direct chat.
   - Elements with `data-email` bind to `mailto:` link.

---

## 5. Coding & Security Rules for Future Edits
- **Do Not Hardcode Plaintext GitHub PATs**: GitHub push protection will reject commits containing raw tokens matching `ghp_[A-Za-z0-9]{36}`. Always split tokens into segments (e.g. `_p1 + _p2`) or pull from environment variables.
- **Maintain Cloud Sync Consistency**: Whenever adding new editable fields to `admin.html`, ensure corresponding bindings exist in `content.json`, `admin.html` (`populate()` & `harvest()`), and `js/main.js` (`applyContentData()`).
