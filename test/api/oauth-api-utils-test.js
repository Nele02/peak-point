import { assert } from "chai";
import { buildRedirectUrl, createOAuthSession, createOAuthChallenge } from "../../src/api/oauth-api.js";

suite("OAuth API utils tests", () => {
  test("createOAuthSession should stringify _id", () => {
    const fakeUser = {
      _id: { toString: () => "65f0c1d2e3a4b5c6d7e8f901" },
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
    };

    const session = createOAuthSession(fakeUser, "test-token");

    assert.equal(session._id, "65f0c1d2e3a4b5c6d7e8f901");
    assert.equal(session.email, "test@example.com");
    assert.equal(session.name, "Test User");
    assert.equal(session.token, "test-token");
  });

  test("createOAuthChallenge should include 2fa fields", () => {
    const fakeUser = {
      _id: { toString: () => "u123" },
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
    };

    const challenge = createOAuthChallenge(fakeUser, "temp-123");

    assert.equal(challenge.twoFactorRequired, true);
    assert.equal(challenge.tempToken, "temp-123");
    assert.equal(challenge.email, "test@example.com");
    assert.equal(challenge.name, "Test User");
    assert.equal(challenge._id, "u123");
  });

  test("buildRedirectUrl should append query with ?", () => {
    const url = buildRedirectUrl("http://localhost:5173/oauth/callback", {
      token: "abc",
      email: "x@y.com",
      name: "Test User",
      _id: "123",
    });

    assert.include(url, "http://localhost:5173/oauth/callback?");
    assert.include(url, "token=abc");
    assert.include(url, "email=x%40y.com");
    assert.include(url, "name=Test%20User");
    assert.include(url, "_id=123");
  });

  test("buildRedirectUrl should serialize 2fa challenge params", () => {
    const url = buildRedirectUrl("http://localhost:5173/oauth/callback", {
      twoFactorRequired: true,
      tempToken: "temp-xyz",
      email: "x@y.com",
      name: "Test User",
      _id: "123",
    });

    assert.include(url, "twoFactorRequired=true");
    assert.include(url, "tempToken=temp-xyz");
    assert.include(url, "email=x%40y.com");
    assert.include(url, "name=Test%20User");
    assert.include(url, "_id=123");
  });
});
