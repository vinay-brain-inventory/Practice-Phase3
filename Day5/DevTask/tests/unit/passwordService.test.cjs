const { hashPassword, verifyPassword } = require("../../src/services/passwordService");

describe("passwordService", () => {
  test("hashes and verifies password", async () => {
    const hash = await hashPassword("pass1234");
    await expect(verifyPassword("pass1234", hash)).resolves.toBe(true);
    await expect(verifyPassword("nope", hash)).resolves.toBe(false);
  });
});

