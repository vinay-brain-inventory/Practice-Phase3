const request = require("supertest");
const { createApp } = require("../../src/app");
const { connectMongo, disconnectMongo } = require("../../src/config/db");
const { env, requireEnv } = require("../../src/config/env");
const { User } = require("../../src/config/models/User");
const { signAccessToken } = require("../../src/services/tokenService");
const { MongoMemoryServer } = require("mongodb-memory-server");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

describe("integration", () => {
  const app = createApp();
  let memoryMongo;

  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
    const uri = env.mongoUriTest || process.env.MONGO_URI_TEST;
    if (uri) {
      await connectMongo(uri);
    } else {
      memoryMongo = await MongoMemoryServer.create();
      await connectMongo(memoryMongo.getUri("day5_test"));
    }
    await User.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
    await disconnectMongo();
    if (memoryMongo) await memoryMongo.stop();
  });

  test("health works", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
  });

  test("register then login", async () => {
    const email = `u${Date.now()}@t.com`;
    const registerRes = await request(app).post("/api/auth/register").send({ email, password: "pass1234" });
    expect(registerRes.status).toBe(201);

    const loginRes = await request(app).post("/api/auth/login").send({ email, password: "pass1234" });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty("accessToken");
  });

  test("protected route missing token -> 401", async () => {
    const res = await request(app).get("/api/protected/user");
    expect(res.status).toBe(401);
  });

  test("protected route invalid token -> 401", async () => {
    const res = await request(app)
      .get("/api/protected/user")
      .set("Authorization", "Bearer invalid.token.here");
    expect(res.status).toBe(401);
  });

  test("protected route expired token -> 401", async () => {
    const token = signAccessToken({ sub: "u1", role: "user" }, requireEnv("JWT_SECRET"), "1ms");
    await sleep(10);
    const res = await request(app).get("/api/protected/user").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(401);
  });

  test("wrong role -> 403", async () => {
    const token = signAccessToken({ sub: "u1", role: "user" }, requireEnv("JWT_SECRET"), "1h");
    const res = await request(app).get("/api/protected/admin").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test("admin role -> 200", async () => {
    const token = signAccessToken({ sub: "u1", role: "admin" }, requireEnv("JWT_SECRET"), "1h");
    const res = await request(app).get("/api/protected/admin").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});

