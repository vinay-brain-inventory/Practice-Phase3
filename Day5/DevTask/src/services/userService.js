async function createUser(UserModel, data) {
  const user = await UserModel.create(data);
  return user;
}

async function findUserByEmail(UserModel, email) {
  return UserModel.findOne({ email });
}

async function ensureEmailAvailable(UserModel, email) {
  const existing = await findUserByEmail(UserModel, email);
  if (existing) {
    const err = new Error("Email already registered");
    err.statusCode = 409;
    throw err;
  }
}

module.exports = { createUser, findUserByEmail, ensureEmailAvailable };

