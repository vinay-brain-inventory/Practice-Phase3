const { signAccessToken, verifyAccessToken } = require("../../src/services/tokenService");

describe("tokenService", () => {
  test("signs and verifies token", () => {
    const token = signAccessToken({ sub: "u1", role: "user" }, "secret", "1h");
    const payload = verifyAccessToken(token, "secret");
    expect(payload.sub).toBe("u1");
    expect(payload.role).toBe("user");
  });

  test("throws on invalid token", () => {
    expect(() => verifyAccessToken("nope", "secret")).toThrow();
  });
});

