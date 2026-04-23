const authService = require("../../src/services/authService");
const bcrypt = require("bcryptjs");

function createUserModelMock() {
  return {
    create: jest.fn(),
    findOne: jest.fn()
  };
}

describe("authService.register", () => {
  test("registers new user", async () => {
    const UserModel = createUserModelMock();
    UserModel.findOne.mockResolvedValue(null);
    UserModel.create.mockResolvedValue({ _id: "u1", email: "a@b.com", role: "user" });

    const result = await authService.register({
      UserModel,
      email: "a@b.com",
      password: "pass1234"
    });

    expect(result).toEqual({ id: "u1", email: "a@b.com", role: "user" });
    expect(UserModel.findOne).toHaveBeenCalledWith({ email: "a@b.com" });
    expect(UserModel.create).toHaveBeenCalled();
  });

  test("fails when email missing", async () => {
    const UserModel = createUserModelMock();
    await expect(
      authService.register({ UserModel, email: "", password: "x" })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test("fails when email already exists", async () => {
    const UserModel = createUserModelMock();
    UserModel.findOne.mockResolvedValue({ _id: "u1" });
    await expect(
      authService.register({ UserModel, email: "a@b.com", password: "x" })
    ).rejects.toMatchObject({ statusCode: 409 });
  });
});

describe("authService.login", () => {
  test("returns token on valid credentials", async () => {
    const UserModel = createUserModelMock();
    const passwordHash = await bcrypt.hash("pass1234", 10);
    UserModel.findOne.mockResolvedValue({
      _id: "u1",
      email: "a@b.com",
      role: "user",
      passwordHash
    });

    const result = await authService.login({
      UserModel,
      email: "a@b.com",
      password: "pass1234",
      jwtSecret: "secret",
      jwtExpiresIn: "1h"
    });

    expect(result).toHaveProperty("accessToken");
  });

  test("fails on missing credentials", async () => {
    const UserModel = createUserModelMock();
    await expect(
      authService.login({ UserModel, email: "", password: "", jwtSecret: "s", jwtExpiresIn: "1h" })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test("fails when user not found", async () => {
    const UserModel = createUserModelMock();
    UserModel.findOne.mockResolvedValue(null);
    await expect(
      authService.login({ UserModel, email: "a@b.com", password: "x", jwtSecret: "s", jwtExpiresIn: "1h" })
    ).rejects.toMatchObject({ statusCode: 401 });
  });
});

