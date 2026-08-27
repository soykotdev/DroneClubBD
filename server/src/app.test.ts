import { describe, expect, it, beforeAll } from "vitest";
import request from "supertest";

// The env module validates process.env at import time — set safe dummy
// values before anything under test imports it (no live MongoDB required
// for these cases: the health check never touches the DB, and invalid
// input is rejected by Zod validation before any repository call).
beforeAll(() => {
  process.env.NODE_ENV = "test";
  process.env.MONGODB_URI = "mongodb://localhost:27017/droneclub_test";
  process.env.JWT_ACCESS_SECRET = "test-access-secret-needs-32-characters-minimum";
  process.env.JWT_REFRESH_SECRET = "test-refresh-secret-needs-32-characters-minimum";
  process.env.COOKIE_SECRET = "test-cookie-secret-needs-32-characters-minimum";
  process.env.CORS_ALLOWED_ORIGINS = "http://localhost:5173";
});

describe("createApp", () => {
  it("responds to the health check without touching the database", async () => {
    const { createApp } = await import("./app.js");
    const response = await request(createApp()).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, data: { status: "ok" } });
  });

  it("returns a typed 404 for an unknown route", async () => {
    const { createApp } = await import("./app.js");
    const response = await request(createApp()).get("/api/does-not-exist");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("NOT_FOUND");
  });

  it("rejects an invalid contact submission with a 422 validation error before reaching the database", async () => {
    const { createApp } = await import("./app.js");
    const response = await request(createApp()).post("/api/public/contact").send({ name: "A", email: "not-an-email" });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(response.body.error.fieldErrors).toHaveProperty("email");
  });

  it("marks admin routes as non-indexable", async () => {
    const { createApp } = await import("./app.js");
    const response = await request(createApp()).get("/api/admin/dashboard");

    expect(response.headers["x-robots-tag"]).toBe("noindex, nofollow");
    expect(response.status).toBe(401); // no access token — requireAuth rejects before role checks
  });
});
