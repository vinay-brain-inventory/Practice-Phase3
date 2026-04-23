const { ensureEmailAvailable, createUser, findUserByEmail } = require("./userService");
const { hashPassword, verifyPassword } = require("./passwordService");
const { signAccessToken } = require("./tokenService");

async function register({ UserModel, email, password, role }) {
  if (!email || !password) {
    const err = new Error("Email and password are required");
    err.statusCode = 400;
    throw err;
  }

  await ensureEmailAvailable(UserModel, email);
  const passwordHash = await hashPassword(password);
  const user = await createUser(UserModel, { email, passwordHash, role: role || "user" });
  return { id: String(user._id), email: user.email, role: user.role };
}

async function login({ UserModel, email, password, jwtSecret, jwtExpiresIn }) {
  if (!email || !password) {
    const err = new Error("Email and password are required");
    err.statusCode = 400;
    throw err;
  }

  if (!jwtSecret) throw new Error("JWT secret is required");
  const user = await findUserByEmail(UserModel, email);
  if (!user) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  const token = signAccessToken({ sub: String(user._id), role: user.role }, jwtSecret, jwtExpiresIn);
  return { accessToken: token };
}

module.exports = { register, login };

