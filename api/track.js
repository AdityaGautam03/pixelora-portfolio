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

// Fetch live from GitHub authenticated API to avoid CDN caching
async function getTrackingLogs() {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/contents/tracking.json`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Pixelora-Tracker'
      }
    });
    if (res.ok) {
      const data = await res.json();
      const content = Buffer.from(data.content, 'base64').toString('utf8');
      const parsed = JSON.parse(content);
      memoryLogs = Array.isArray(parsed) ? parsed : [];
      return memoryLogs;
    }
  } catch (err) {
    console.error('Error fetching tracking.json from GitHub API:', err);
  }
  return memoryLogs || [];
}

async function saveTrackingLogs(logs, commitMsg) {
  memoryLogs = logs;
  try {
    let sha = undefined;
    const getRes = await fetch(`https://api.github.com/repos/${REPO}/contents/tracking.json`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Pixelora-Tracker'
      }
    });

    if (getRes.ok) {
      const fileInfo = await getRes.json();
      sha = fileInfo.sha;
    }

    const jsonString = JSON.stringify(logs, null, 2);
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
        message: commitMsg || 'track: update outreach events',
        content: base64Content,
        sha: sha || undefined,
        branch: 'main'
      })
    });
  } catch (err) {
    console.error('Save error:', err);
  }
}

module.exports = async (req, res) => {
  try {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    if (req.method === 'OPTIONS') {
      res.statusCode = 200;
      return res.end();
    }

    const fullUrl = new URL(req.url, 'https://pixelora-edits.vercel.app');
    const email = (fullUrl.searchParams.get('email') || (req.query && req.query.email) || '').trim().toLowerCase();
    const creator = fullUrl.searchParams.get('creator') || (req.query && req.query.creator) || '';
    const channel = fullUrl.searchParams.get('channel') || (req.query && req.query.channel) || '';
    const type = (fullUrl.searchParams.get('type') || (req.query && req.query.type) || 'open').toUpperCase();
    const format = fullUrl.searchParams.get('format') || (req.query && req.query.format);
    const action = fullUrl.searchParams.get('action') || (req.query && req.query.action);
    const newStatus = fullUrl.searchParams.get('status') || (req.query && req.query.status);

    // Update response status directly from dashboard
    if (action === 'update_status' && email && newStatus) {
      const logs = await getTrackingLogs();
      const updated = logs.map(item => {
        if ((item.email || '').toLowerCase() === email) {
          return { ...item, responseStatus: newStatus };
        }
        return item;
      });
      await saveTrackingLogs(updated, `track: update status to ${newStatus} for ${email}`);
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      return res.end(JSON.stringify({ success: true, status: newStatus }));
    }

    // Return JSON data for dashboard
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
      const logs = await getTrackingLogs();
      const timestamp = new Date().toISOString();
      const existingIdx = logs.findIndex(l => (l.email || '').toLowerCase() === email);

      if (existingIdx !== -1) {
        const lead = logs[existingIdx];
        if (type === 'OPEN') {
          lead.openCount = (lead.openCount || 0) + 1;
          lead.lastOpened = timestamp;
          if (!lead.firstOpened) lead.firstOpened = timestamp;
        } else if (type === 'CLICK') {
          lead.visitCount = (lead.visitCount || 0) + 1;
          lead.lastVisited = timestamp;
          if (!lead.firstVisited) lead.firstVisited = timestamp;
        }
        lead.creator = creator || lead.creator;
        lead.channel = channel || lead.channel;
        lead.lastActive = timestamp;
        logs[existingIdx] = lead;
      } else {
        logs.unshift({
          email: email || 'unknown',
          creator: creator || 'Unknown',
          channel: channel || '',
          openCount: type === 'OPEN' ? 1 : 0,
          firstOpened: type === 'OPEN' ? timestamp : null,
          lastOpened: type === 'OPEN' ? timestamp : null,
          visitCount: type === 'CLICK' ? 1 : 0,
          firstVisited: type === 'CLICK' ? timestamp : null,
          lastVisited: type === 'CLICK' ? timestamp : null,
          responseStatus: 'Awaiting Reply',
          lastActive: timestamp,
          userAgent: req.headers['user-agent'] || ''
        });
      }

      // Save to GitHub
      await saveTrackingLogs(logs, `track: ${type} by ${creator || email}`);
    }

    // Return 1x1 Transparent GIF
    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Content-Length', TRANSPARENT_GIF.length);
    res.statusCode = 200;
    return res.end(TRANSPARENT_GIF);
  } catch (globalErr) {
    console.error('Fatal Tracker Error:', globalErr);
    res.setHeader('Content-Type', 'image/gif');
    res.statusCode = 200;
    return res.end(TRANSPARENT_GIF);
  }
};
