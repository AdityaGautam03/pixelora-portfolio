# Deploying Pixelora

Step-by-step guide to publishing your one-page portfolio website online for free using **Netlify** or **GitHub Pages**, and connecting your own custom domain.

---

## 1. Pre-Launch Checklist

Before publishing, ensure you have filled in your personal details and real content:

### A. Contact Details & Socials (`js/main.js`)
Open `js/main.js` and locate the `CONFIG` object at the top:
```js
var CONFIG = {
  instagramUsername: 'INSTAGRAM_USERNAME', // Your Instagram username (without @)
  email: 'hello@pixelora.in',             // Your business or contact email
  showreel: 'assets/videos/showreel.mp4', // MP4 path or YouTube / Vimeo link
  social: {
    instagram: '',                        // Left blank to default to https://instagram.com/INSTAGRAM_USERNAME
    youtube: 'https://youtube.com/@yourchannel',
    linkedin: 'https://linkedin.com/in/yourprofile',
    behance: 'https://behance.net/yourportfolio'
  }
};
```

### B. Replace Sample Work Tiles (`index.html`)
In `index.html`, each project is an `<article class="tile" ...>`:
- Update `data-title` and `data-sub` (e.g. client name, project type).
- Add `data-video` with your video URL (YouTube, Vimeo, or MP4 path).
- Optionally set `data-preview` for short hover clips.
- Set `data-poster` for the thumbnail image.
- Set `data-cat` with relevant categories (`youtube reels ads grading motion thumbnails sound`).

### C. Update Domain Placeholders
Replace `YOUR-DOMAIN` (e.g., `pixelora.in`) in:
1. **`index.html`**:
   - `<link rel="canonical" href="https://pixelora.in/">`
   - `<meta property="og:image" content="https://pixelora.in/assets/images/og-image.png">`
   - `<meta property="og:url" content="https://pixelora.in/">`
2. **`robots.txt`**:
   - `Sitemap: https://pixelora.in/sitemap.xml`
3. **`sitemap.xml`**:
   - `<loc>https://pixelora.in/</loc>`

### D. Viewer Placeholder Notice
When a project or showreel tile doesn't have a video URL yet, a polite placeholder message is shown. Once all videos are linked, this message is never displayed. If you wish to disable or customize the placeholder fallback, refer to the comment in `js/main.js` around line 175.

---

## 2. Deploy on Netlify (Easiest — Drag & Drop)

Netlify provides free hosting, global CDN, and automatic HTTPS SSL certificates.

### Step 1: Sign Up / Log In
1. Go to [Netlify.com](https://www.netlify.com/) and log in (or sign up with GitHub/Email).
2. Go to your **Sites** dashboard.

### Step 2: Drag and Drop the Folder
1. Find the section that says **"Want to deploy a new site without connecting to Git? Drag and drop your site output folder here"** at [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag this entire `pixelora-onepage` folder into the drop zone.
3. In 5–10 seconds, your site is live at a random address like `https://amazing-name-12345.netlify.app`.

### Step 3: Set a Site Name
1. Go to **Site configuration** > **General** > **Site details** > **Change site name**.
2. Change it to something readable, e.g. `pixelora.netlify.app`.

---

## 3. Deploy on GitHub Pages (Free via Git)

GitHub Pages hosts static websites directly from your GitHub repository.

### Step 1: Create a GitHub Repository
1. Log in to [GitHub.com](https://github.com/) and click **New Repository**.
2. Name it (e.g. `pixelora` or `pixelora.github.io`) and set it to **Public**.

### Step 2: Push Your Code
Open your terminal inside this folder and run:
```bash
git init
git add .
git commit -m "Initial commit of Pixelora portfolio"
git branch -M main
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO>.git
git push -u origin main
```

### Step 3: Enable GitHub Pages
1. Go to your repository on GitHub.
2. Click **Settings** > **Pages** (in the left sidebar).
3. Under **Build and deployment** > **Branch**, select `main` and `/ (root)`.
4. Click **Save**.
5. Your site will be published at `https://<YOUR-USERNAME>.github.io/<YOUR-REPO>/` in about 1–2 minutes.

---

## 4. Connecting a Custom Domain (e.g. `pixelora.in`)

### On Netlify:
1. In your Netlify site dashboard, click **Domain management** > **Add custom domain**.
2. Enter your domain name (e.g., `pixelora.in` or `www.pixelora.in`).
3. Log in to your domain registrar (GoDaddy, Namecheap, Cloudflare, Google Domains, etc.) and add DNS records:
   - **Apex domain (`pixelora.in`)**: An `A` record pointing to Netlify's load balancer IP `75.2.60.5`.
   - **Subdomain (`www.pixelora.in`)**: A `CNAME` record pointing to your Netlify site (e.g., `pixelora.netlify.app`).
4. Netlify will automatically provision a free Let's Encrypt SSL certificate within a few minutes.

### On GitHub Pages:
1. In your GitHub repository **Settings** > **Pages**, scroll down to **Custom domain**.
2. Enter your domain (e.g. `pixelora.in`) and click **Save**.
3. In your domain registrar DNS settings:
   - Add four `A` records for `@` pointing to GitHub Pages IPs:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
   - Add a `CNAME` record for `www` pointing to `<YOUR-USERNAME>.github.io`.
4. Check **Enforce HTTPS** in GitHub Pages settings once DNS has propagated.

---

## 5. Post-Deployment Smoke Test

Once live:
- [ ] Open your URL on a mobile device and laptop.
- [ ] Tap the "LET'S TALK" button — verify it opens Instagram direct chat in a new tab.
- [ ] Click the showreel button — verify the dialog video modal opens.
- [ ] Try filtering projects (YouTube, Reels, Ads, Color grading, Motion, Thumbnails).
- [ ] Test the Before/After slider to ensure smooth dragging.
- [ ] Verify that scrolling updates the active navigation tab.
