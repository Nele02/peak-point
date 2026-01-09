import Mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./user.js";

const saltRounds = 10;

function splitName(displayName) {
  if (!displayName) return { firstName: "OAuth", lastName: "User" };
  const parts = displayName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "User" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export const userMongoStore = {
  async getAllUsers() {
    const users = await User.find().lean();
    return users;
  },

  async getUserById(id) {
    if (Mongoose.isValidObjectId(id)) {
      const user = await User.findOne({ _id: id }).lean();
      return user;
    }
    return null;
  },

  async addUser(user) {
    if (!user) {
      const newUser = new User({});
      const userObj = await newUser.save();
      const u = await this.getUserById(userObj._id);
      return u;
    }

    const newUser = new User(user);

    if (user.password) {
      const hashedPassword = await bcrypt.hash(user.password, saltRounds);
      newUser.password = hashedPassword;
    }

    const userObj = await newUser.save();
    const u = await this.getUserById(userObj._id);
    return u;
  },

  async getUserByEmail(email) {
    const user = await User.findOne({ email: email }).lean();
    return user;
  },

  async getUserByGithubId(githubId) {
    if (!githubId) return null;
    return await User.findOne({ githubId }).lean();
  },

  async upsertGithubUser(profile) {
    const githubId = profile?.id;
    const email = profile?.email || profile?.raw?.email;
    const displayName = profile?.displayName || profile?.username || "OAuth User";
    const name = splitName(displayName);

    let user = await this.getUserByGithubId(githubId);

    if (!user && email) user = await this.getUserByEmail(email);

    if (!user) {
      const tempPassword = await bcrypt.hash(`oauth-github-${githubId}`, saltRounds);

      const newUser = new User({
        firstName: name.firstName,
        lastName: name.lastName,
        email: email ?? `github-${githubId}@no-email.local`,
        password: tempPassword,
        githubId,
      });

      const saved = await newUser.save();
      return this.getUserById(saved._id);
    }
    
    if (!user.githubId) {
      await User.updateOne({ _id: user._id }, { $set: { githubId } });
    }

    return this.getUserById(user._id);
  },

  async deleteUserById(id) {
    try {
      await User.deleteOne({ _id: id });
    } catch (error) {
      console.log("bad id");
    }
  },

  async deleteAll() {
    await User.deleteMany({});
  }
};
