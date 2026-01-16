import Mongoose from "mongoose";

const { Schema } = Mongoose;

const userSchema = new Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,

  // oauth
  githubId: String,
  googleId: String,

  // 2fa
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String, default: "" },

  // Recovery codes
  recoveryCodes: [
    {
      codeHash: String,
      usedAt: Date,
    },
  ],
});

export const User = Mongoose.model("User", userSchema);
