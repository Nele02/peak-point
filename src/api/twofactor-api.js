import Boom from "@hapi/boom";
import speakeasy from "speakeasy";
import crypto from "crypto";
import { validationError } from "./logger.js";
import { User } from "../models/mongo/user.js";
import { createToken, verifyTwoFactorToken } from "./jwt-utils.js";

function hashCode(code) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

function generateRecoveryCodes(count = 10) {
  const plain = [];
  const hashed = [];

  for (let i = 0; i < count; i++) {
    const raw = crypto.randomBytes(4).toString("hex"); // 8 chars
    const code = `${raw.slice(0, 4)}-${raw.slice(4)}`;
    plain.push(code);
    hashed.push({ codeHash: hashCode(code) });
  }

  return { plain, hashed };
}

export const twoFactorApi = {
  setup: {
    auth: { strategy: "jwt" },
    handler: async function (request, h) {
      try {
        const authUser = request.auth.credentials;
        const user = await User.findById(authUser._id);
        if (!user) return Boom.notFound("User not found");

        const secret = speakeasy.generateSecret({
          name: `PeakPoint (${user.email})`,
        });

        // store secret
        user.twoFactorSecret = secret.base32;
        await user.save();

        return h.response({ otpauthUrl: secret.otpauth_url }).code(200);
      } catch (err) {
        return Boom.serverUnavailable("2FA setup failed");
      }
    },
    tags: ["api"],
    description: "Generate a 2FA secret",
    notes: "Returns otpauthUrl for QR code generation on client",
    validate: { failAction: validationError },
  },

  verifySetup: {
    auth: { strategy: "jwt" },
    handler: async function (request, h) {
      try {
        const authUser = request.auth.credentials;
        const { code } = request.payload;

        const user = await User.findById(authUser._id);
        if (!user) return Boom.notFound("User not found");
        if (!user.twoFactorSecret) return Boom.badRequest("2FA secret missing");

        const ok = speakeasy.totp.verify({
          secret: user.twoFactorSecret,
          encoding: "base32",
          token: String(code),
          window: 1,
        });

        if (!ok) return Boom.unauthorized("Invalid 2FA code");

        const { plain, hashed } = generateRecoveryCodes(10);

        user.twoFactorEnabled = true;
        user.recoveryCodes = hashed;
        await user.save();

        // show plain codes only once
        return h.response({ enabled: true, recoveryCodes: plain }).code(200);
      } catch (err) {
        return Boom.serverUnavailable("2FA verify failed");
      }
    },
    tags: ["api"],
    description: "Verify setup code and enable 2FA",
    notes: "Enables 2FA and returns recovery codes (shown once)",
    validate: { failAction: validationError },
  },

  verifyLogin: {
    auth: false,
    handler: async function (request, h) {
      try {
        const { tempToken, code } = request.payload;

        let decoded;
        try {
          decoded = verifyTwoFactorToken(tempToken);
        } catch (e) {
          return Boom.unauthorized("Invalid temp token");
        }

        const user = await User.findById(decoded.id);
        if (!user) return Boom.notFound("User not found");
        if (!user.twoFactorEnabled) return Boom.badRequest("2FA not enabled");

        const ok = speakeasy.totp.verify({
          secret: user.twoFactorSecret,
          encoding: "base32",
          token: String(code),
          window: 1,
        });

        if (!ok) return Boom.unauthorized("Invalid 2FA code");

        const token = createToken(user);
        return h
          .response({
            success: true,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            token,
            _id: user._id.toString(),
          })
          .code(201);
      } catch (err) {
        return Boom.serverUnavailable("2FA login failed");
      }
    },
    tags: ["api"],
    description: "Verify 2FA login",
    notes: "Exchanges tempToken + TOTP code for a real JWT",
    validate: { failAction: validationError },
  },

  recoveryLogin: {
    auth: false,
    handler: async function (request, h) {
      try {
        const { tempToken, recoveryCode } = request.payload;

        let decoded;
        try {
          decoded = verifyTwoFactorToken(tempToken);
        } catch (e) {
          return Boom.unauthorized("Invalid temp token");
        }

        const user = await User.findById(decoded.id);
        if (!user) return Boom.notFound("User not found");
        if (!user.twoFactorEnabled) return Boom.badRequest("2FA not enabled");

        const incomingHash = hashCode(String(recoveryCode).trim());
        const entry = (user.recoveryCodes || []).find((c) => c.codeHash === incomingHash && !c.usedAt);

        if (!entry) return Boom.unauthorized("Invalid recovery code");

        entry.usedAt = new Date();
        await user.save();

        const token = createToken(user);
        return h
          .response({
            success: true,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            token,
            _id: user._id.toString(),
          })
          .code(201);
      } catch (err) {
        return Boom.serverUnavailable("Recovery login failed");
      }
    },
    tags: ["api"],
    description: "Login using recovery code",
    notes: "Single-use recovery code to complete login",
    validate: { failAction: validationError },
  },
};
