const express = require("express");
const { requireEnv } = require("../config/env");
const { authRequired, requireRole } = require("../middleware/auth");
const { userProfile, adminOnly } = require("../controllers/protectedController");

const router = express.Router();

router.get("/user", authRequired({ jwtSecret: () => requireEnv("JWT_SECRET") }), userProfile);
router.get("/admin", authRequired({ jwtSecret: () => requireEnv("JWT_SECRET") }), requireRole("admin"), adminOnly);

module.exports = { protectedRoutes: router };

