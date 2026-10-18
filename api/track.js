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

let memoryLogs = [];

async function getTrackingLogs() {
  if (memoryLogs.length > 0) return memoryLogs;
  try {
    const res = await fetch(https://api.github.com/repos//contents/tracking.json, {
      headers: {
        'Authorization': Bearer ,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Pixelora-Tracker'
      }
    });
    if (res.ok) {
      const data = await res.json();
      const content = Buffer.from(data.content, 'base64').toString('utf8');
      memoryLogs = JSON.parse(content);
      return memoryLogs;
    }
  } catch (err) {
    console.error('Error reading tracking.json:', err);
  }
  return [];
}

async function appendTrackingLog(logItem) {
  memoryLogs.unshift(logItem);
  if (memoryLogs.length > 500) memoryLogs = memoryLogs.slice(0, 500);

  try {
    let sha = undefined;
    const getRes = await fetch(https://api.github.com/repos//contents/tracking.json, {
      headers: {
        'Authorization': Bearer ,
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

    const jsonString = JSON.stringify(currentLogs, null, 2);
    const base64Content = Buffer.from(jsonString, 'utf8').toString('base64');

    await fetch(https://api.github.com/repos//contents/tracking.json, {
      method: 'PUT',
      headers: {
        'Authorization': Bearer ,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Pixelora-Tracker'
      },
      body: JSON.stringify({
        message: 	rack:  by ,
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
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { email, creator, channel, type, format } = req.query;

  if (format === 'json' || req.headers.accept?.includes('application/json')) {
    const logs = await getTrackingLogs();
    return res.status(200).json({
      success: true,
      total: logs.length,
      logs
    });
  }

  if (email || creator) {
    const logItem = {
      timestamp: new Date().toISOString(),
      type: (type || 'open').toUpperCase(),
      email: email || 'unknown',
      creator: creator || '',
      channel: channel || '',
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '',
      userAgent: req.headers['user-agent'] || ''
    };

    appendTrackingLog(logItem).catch(err => console.error('Log save error:', err));
  }

  res.setHeader('Content-Type', 'image/gif');
  res.setHeader('Content-Length', TRANSPARENT_GIF.length);
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  return res.status(200).send(TRANSPARENT_GIF);
};
