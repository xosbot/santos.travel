// API Key authentication middleware
// Supports:
//   - Header: Authorization: Bearer <key>
//   - Header: X-API-Key: <key>
//   - Query: ?api_key=<key>

const API_KEYS = new Set();

// Load keys from env on startup
function init() {
  const keys = process.env.API_KEYS;
  if (keys) {
    keys.split(',').map(k => k.trim()).filter(Boolean).forEach(k => API_KEYS.add(k));
  }
  // Always allow if no keys are configured (dev mode)
}

init();

function requireAuth(req, res, next) {
  // Skip auth for health check and webhook endpoints (they have their own validation)
  if (req.path === '/health' || req.path.startsWith('/webhook/') || req.path.startsWith('/admin')) {
    return next();
  }

  // Dev mode: no keys configured → allow all
  if (API_KEYS.size === 0 && process.env.NODE_ENV !== 'production') {
    return next();
  }

  const token =
    req.headers.authorization?.replace(/^Bearer\s+/i, '') ||
    req.headers['x-api-key'] ||
    req.query.api_key;

  if (!token || !API_KEYS.has(token)) {
    return res.status(401).json({ error: 'unauthorized: invalid or missing API key' });
  }

  next();
}

function generateApiKey() {
  const { randomBytes } = require('crypto');
  return 'st_' + randomBytes(24).toString('hex');
}

module.exports = { requireAuth, generateApiKey, init };
