const { createUser, findUserByEmail, ensureEmailAvailable } = require("../../src/services/userService");

function createUserModelMock() {
  return {
    create: jest.fn(),
    findOne: jest.fn()
  };
}

describe("userService", () => {
  test("createUser creates and returns user", async () => {
    const UserModel = createUserModelMock();
    UserModel.create.mockResolvedValue({ _id: "u1", email: "a@b.com" });
    const user = await createUser(UserModel, { email: "a@b.com" });
    expect(user).toEqual({ _id: "u1", email: "a@b.com" });
    expect(UserModel.create).toHaveBeenCalledWith({ email: "a@b.com" });
  });

  test("findUserByEmail queries by email", async () => {
    const UserModel = createUserModelMock();
    UserModel.findOne.mockResolvedValue({ _id: "u1" });
    const user = await findUserByEmail(UserModel, "a@b.com");
    expect(UserModel.findOne).toHaveBeenCalledWith({ email: "a@b.com" });
    expect(user).toEqual({ _id: "u1" });
  });

  test("ensureEmailAvailable throws when taken", async () => {
    const UserModel = createUserModelMock();
    UserModel.findOne.mockResolvedValue({ _id: "u1" });
    await expect(ensureEmailAvailable(UserModel, "a@b.com")).rejects.toMatchObject({ statusCode: 409 });
  });

  test("ensureEmailAvailable resolves when free", async () => {
    const UserModel = createUserModelMock();
    UserModel.findOne.mockResolvedValue(null);
    await expect(ensureEmailAvailable(UserModel, "a@b.com")).resolves.toBeUndefined();
  });
});

