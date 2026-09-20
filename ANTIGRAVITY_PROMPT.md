# Prompt to paste into Antigravity

I am giving you a finished, approved frontend for a ONE-PAGE portfolio website. Read `README.md` first. **Do not redesign anything.** Colors, fonts, spacing, layout and components are approved and must stay identical. Compare your result against the screenshots in `assets/design-reference/`.

## Most important rule: this is ONE page

The visitor stays on the Home tab and scrolls down. Below the hero the sections appear in this order, all inside `index.html`:

1. Home (`#home`): hero
2. About (`#about`): intro, "what I do" ticker band, "Software I use"
3. Work (`#work`): all projects with filters
4. Services (`#services`): six service cards
5. Pink banner "Got footage? Let's make it worth watching." and the footer

The nav tabs (Home, About, Work, Services) scroll smoothly to those sections, and the active tab changes automatically while scrolling. There must be NO separate pages, no `about.html`, `work.html` or `services.html`, and no router. If the folder you are working in contains such old files, delete them.

## Project state

- Plain HTML, CSS and vanilla JavaScript. Keep it that way. No framework unless I ask.
- `index.html`, `css/style.css`, `js/main.js` are complete and tested. All behaviour is already built: sticky nav, scroll spy, mobile menu, work filters, video viewer (`<dialog>`), hover previews, before/after slider, scrolling timeline strip, ticker band, scroll reveal, SEO tags.
- Contact details live in one `CONFIG` object at the top of `js/main.js`.

## Your tasks

1. **Run it and verify.** Serve the folder and check the page at 1440px and 390px wide against `assets/design-reference/desktop-full-page-1440.png` and `mobile-full-page-390.png`. Expected desktop height is about 6790px and mobile about 10550px. Fix only real differences or bugs, and tell me what you changed.
2. **Check every interaction:** nav tabs scroll to the right section and highlight correctly, mobile menu opens and closes and closes after a tap on a link, filters work, the viewer opens from the showreel button and from each tile and closes with X, Escape and a click outside, the before/after slider drags with mouse, touch and arrow keys, the strip and ticker animate and stop with `prefers-reduced-motion`.
3. **Keep it fast and accessible.** Lighthouse Performance, Accessibility, Best Practices and SEO should be above 90 on mobile. Fix anything that blocks that without changing the look (image sizes, preload, font loading, contrast, focus states).
4. **Polish only if needed:** small cross-browser issues (Safari and Firefox: `dialog`, `backdrop-filter`, the `translate` property, `aspect-ratio`), and layouts at in-between widths (768px, 1024px, 1280px, 1920px). No visual redesign.
5. **Do not invent content.** Leave clear placeholders for what I will supply later:
   - WhatsApp number, email, phone, social URLs (in `CONFIG`)
   - Showreel video
   - Real work: thumbnails, hover clips, titles, categories (the `data-*` attributes on the tiles in `index.html`)
   - Domain (`YOUR-DOMAIN` in `index.html`, `robots.txt`, `sitemap.xml`)
6. **Hide the placeholder text before launch.** The viewer currently shows "Your video will play here..." when no video is set. Keep that message for now, but add a comment in `js/main.js` explaining how to remove it.
7. **Write `DEPLOY.md`:** step by step, how to publish this folder for free on Netlify (drag and drop) and on GitHub Pages, and how to connect a custom domain.

## Definition of done

- The one-page site matches the screenshots on desktop and mobile.
- No console errors, no broken links or images, no horizontal scrolling on mobile.
- All interactions above work with mouse, touch and keyboard.
- Lighthouse scores above 90.
- `DEPLOY.md` exists.
- You have listed every change you made.
