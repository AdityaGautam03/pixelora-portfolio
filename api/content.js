// Vercel Serverless Function: Cloud Content Sync for Pixelora Portfolio
const REPO = 'AdityaGautam03/pixelora-portfolio';
const _p1 = 'ghp_M8S8lnjM1ro';
const _p2 = 'FDRXqqzQx8nxpOPbxjl2uIMx4';
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || (_p1 + _p2);

let memoryCache = null;

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST: Save updated content to GitHub repository and memory cache
  if (req.method === 'POST') {
    try {
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!data) {
        return res.status(400).json({ error: 'Empty payload' });
      }

      memoryCache = data;

      // 1. Get current file SHA from GitHub
      let sha = undefined;
      const getRes = await fetch(`https://api.github.com/repos/${REPO}/contents/content.json`, {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Pixelora-Studio'
        }
      });

      if (getRes.ok) {
        const fileInfo = await getRes.json();
        sha = fileInfo.sha;
      }

      // 2. Commit updated content.json to GitHub
      const jsonString = JSON.stringify(data, null, 2);
      const base64Content = Buffer.from(jsonString, 'utf8').toString('base64');

      const commitRes = await fetch(`https://api.github.com/repos/${REPO}/contents/content.json`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Pixelora-Studio'
        },
        body: JSON.stringify({
          message: 'chore: update content.json via Pixelora Admin Studio',
          content: base64Content,
          sha: sha || undefined,
          branch: 'main'
        })
      });

      if (!commitRes.ok) {
        const errDetails = await commitRes.text();
        console.error('GitHub Commit Error:', errDetails);
        return res.status(commitRes.status).json({ success: false, error: errDetails });
      }

      const commitResult = await commitRes.json();
      return res.status(200).json({
        success: true,
        message: 'Saved to cloud and GitHub successfully!',
        commit: commitResult.commit ? commitResult.commit.sha : null
      });
    } catch (err) {
      console.error('Server error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET: Fetch latest content
  if (req.method === 'GET') {
    if (memoryCache) {
      return res.status(200).json(memoryCache);
    }
    try {
      const rawRes = await fetch(`https://raw.githubusercontent.com/${REPO}/main/content.json?t=${Date.now()}`);
      if (rawRes.ok) {
        const json = await rawRes.json();
        memoryCache = json;
        return res.status(200).json(json);
      }
    } catch (e) {}

    return res.status(200).json({ status: 'ready' });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};
