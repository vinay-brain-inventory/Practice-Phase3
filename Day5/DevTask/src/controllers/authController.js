const { env, requireEnv } = require("../config/env");
const { User } = require("../config/models/User");
const authService = require("../services/authService");

async function register(req, res, next) {
  try {
    const result = await authService.register({
      UserModel: User,
      email: req.body && req.body.email,
      password: req.body && req.body.password,
      role: req.body && req.body.role
    });
    return res.status(201).json(result);
  } catch (e) {
    return next(e);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login({
      UserModel: User,
      email: req.body && req.body.email,
      password: req.body && req.body.password,
      jwtSecret: requireEnv("JWT_SECRET"),
      jwtExpiresIn: env.jwtExpiresIn
    });
    return res.status(200).json(result);
  } catch (e) {
    return next(e);
  }
}

module.exports = { register, login };

