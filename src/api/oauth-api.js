import Boom from "@hapi/boom";
import qs from "qs";
import { db } from "../models/db.js";
import { createToken } from "./jwt-utils.js";

export function createOAuthSession(user, token) {
  return {
    token,
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
    _id: user._id.toString(), // <-- wichtig: string, nicht buffer/object
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

        const redirectTo =
          request.query.redirectTo ||
          process.env.OAUTH_REDIRECT_URL ||
          "http://localhost:5173/oauth/callback";

        const user = await db.userStore.upsertGithubUser(profile);
        const token = createToken(user);

        const session = createOAuthSession(user, token);
        return h.redirect(buildRedirectUrl(redirectTo, session));
      } catch (err) {
        console.log(err);
        return Boom.serverUnavailable("OAuth failed");
      }
    },
    tags: ["api"],
    description: "GitHub OAuth Login",
    notes: "Redirects back to frontend with a JWT session",
  },
};
