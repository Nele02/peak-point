import Boom from "@hapi/boom";
import qs from "qs";
import { db } from "../models/db.js";
import { createToken, createTwoFactorToken } from "./jwt-utils.js";

export function createOAuthSession(user, token) {
  return {
    token,
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
    _id: user._id.toString()
  };
}

export function createOAuthChallenge(user, tempToken) {
  return {
    twoFactorRequired: true,
    tempToken,
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
    _id: user._id.toString()
  };
}

export function buildRedirectUrl(baseUrl, session) {
  const query = qs.stringify(session);
  const joiner = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${joiner}${query}`;
}

export const oauthApi = {
  github: {
    auth: "github-oauth",
    handler: async function (request, h) {
      try {
        const { profile } = request.auth.credentials;
        const redirectTo = process.env.OAUTH_REDIRECT_URL;

        const user = await db.userStore.upsertGithubUser(profile);

        if (user.twoFactorEnabled) {
          const tempToken = createTwoFactorToken(user);
          const challenge = createOAuthChallenge(user, tempToken);
          return h.redirect(buildRedirectUrl(redirectTo, challenge));
        }

        const token = createToken(user);
        const session = createOAuthSession(user, token);
        return h.redirect(buildRedirectUrl(redirectTo, session));
      } catch (err) {
        console.log(err);
        return Boom.serverUnavailable("OAuth failed");
      }
    }
  },

  google: {
    auth: "google-oauth",
    handler: async function (request, h) {
      try {
        const { profile } = request.auth.credentials;
        const redirectTo = process.env.OAUTH_REDIRECT_URL;

        const user = await db.userStore.upsertGoogleUser(profile);

        if (user.twoFactorEnabled) {
          const tempToken = createTwoFactorToken(user);
          const challenge = createOAuthChallenge(user, tempToken);
          return h.redirect(buildRedirectUrl(redirectTo, challenge));
        }

        const token = createToken(user);
        const session = createOAuthSession(user, token);
        return h.redirect(buildRedirectUrl(redirectTo, session));
      } catch (err) {
        console.log(err);
        return Boom.serverUnavailable("OAuth failed");
      }
    },
    tags: ["api"],
    description: "Google OAuth Login",
    notes: "Redirects back to frontend with a JWT session or a 2FA challenge"
  }
};
