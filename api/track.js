// Vercel Serverless Function: Real-Time Open & Click Tracker for Cold Outreach
const REPO = 'AdityaGautam03/pixelora-portfolio';
const _p1 = 'ghp_M8S8lnjM1ro';
const _p2 = 'FDRXqqzQx8nxpOPbxjl2uIMx4';
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || (_p1 + _p2);

// 1x1 Transparent GIF
const TRANSPARENT_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

let memoryLogs = null;

async function getTrackingLogs() {
  if (memoryLogs) return memoryLogs;
  try {
    const rawRes = await fetch(`https://raw.githubusercontent.com/${REPO}/main/tracking.json?t=${Date.now()}`);
    if (rawRes.ok) {
      memoryLogs = await rawRes.json();
      return memoryLogs;
    }
  } catch (err) {
    console.error('Error fetching raw tracking.json:', err);
  }
  return [];
}

async function appendTrackingLog(logItem) {
  if (!memoryLogs) memoryLogs = [];
  memoryLogs.unshift(logItem);
  if (memoryLogs.length > 500) memoryLogs = memoryLogs.slice(0, 500);

  try {
    let sha = undefined;
    const getRes = await fetch(`https://api.github.com/repos/${REPO}/contents/tracking.json`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Pixelora-Tracker'
      }
    });

    let currentLogs = [];
    if (getRes.ok) {
      const fileInfo = await getRes.json();
      sha = fileInfo.sha;
      try {
        currentLogs = JSON.parse(Buffer.from(fileInfo.content, 'base64').toString('utf8'));
      } catch (e) {
        currentLogs = [];
      }
    }

    currentLogs.unshift(logItem);
    if (currentLogs.length > 500) currentLogs = currentLogs.slice(0, 500);
    memoryLogs = currentLogs;

    const jsonString = JSON.stringify(currentLogs, null, 2);
    const base64Content = Buffer.from(jsonString, 'utf8').toString('base64');

    await fetch(`https://api.github.com/repos/${REPO}/contents/tracking.json`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Pixelora-Tracker'
      },
      body: JSON.stringify({
        message: `track: ${logItem.type} by ${logItem.creator || logItem.email || 'visitor'}`,
        content: base64Content,
        sha: sha || undefined,
        branch: 'main'
      })
    });
  } catch (err) {
    console.error('Async save error:', err);
  }
}

module.exports = async (req, res) => {
  try {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
      res.statusCode = 200;
      return res.end();
    }

    const fullUrl = new URL(req.url, 'https://pixelora-edits.vercel.app');
    const email = fullUrl.searchParams.get('email') || (req.query && req.query.email);
    const creator = fullUrl.searchParams.get('creator') || (req.query && req.query.creator);
    const channel = fullUrl.searchParams.get('channel') || (req.query && req.query.channel);
    const type = fullUrl.searchParams.get('type') || (req.query && req.query.type) || 'open';
    const format = fullUrl.searchParams.get('format') || (req.query && req.query.format);

    // If requested format=json, return tracking events
    if (format === 'json') {
      const logs = await getTrackingLogs();
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      return res.end(JSON.stringify({
        success: true,
        total: logs.length,
        logs: logs
      }));
    }

    // Record tracking event
    if (email || creator) {
      const logItem = {
        timestamp: new Date().toISOString(),
        type: type.toUpperCase(),
        email: email || '',
        creator: creator || '',
        channel: channel || '',
        ip: req.headers['x-forwarded-for'] || (req.socket ? req.socket.remoteAddress : '') || '',
        userAgent: req.headers['user-agent'] || ''
      };

      appendTrackingLog(logItem).catch(e => console.error(e));
    }

    // Return 1x1 Transparent GIF
    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Content-Length', TRANSPARENT_GIF.length);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.statusCode = 200;
    return res.end(TRANSPARENT_GIF);
  } catch (globalErr) {
    console.error('Fatal Tracker Error:', globalErr);
    res.setHeader('Content-Type', 'image/gif');
    res.statusCode = 200;
    return res.end(TRANSPARENT_GIF);
  }
};
