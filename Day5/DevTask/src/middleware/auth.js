const { verifyAccessToken } = require("../services/tokenService");

function parseBearerToken(req) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

function authRequired({ jwtSecret }) {
  return function authMiddleware(req, res, next) {
    const token = parseBearerToken(req);
    if (!token) return res.status(401).json({ error: "Missing token" });

    try {
      const secret = typeof jwtSecret === "function" ? jwtSecret(req) : jwtSecret;
      const payload = verifyAccessToken(token, secret);
      req.user = { id: payload.sub, role: payload.role };
      return next();
    } catch (e) {
      return res.status(401).json({ error: "Invalid token" });
    }
  };
}

function requireRole(role) {
  return function roleMiddleware(req, res, next) {
    const userRole = req.user && req.user.role;
    if (userRole !== role) return res.status(403).json({ error: "Forbidden" });
    return next();
  };
}

module.exports = { authRequired, requireRole };

