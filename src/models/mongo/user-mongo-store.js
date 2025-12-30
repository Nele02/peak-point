import Mongoose from "mongoose";
import { User } from "./user.js";
import bcrypt from "bcryptjs";

const saltRounds = 10;

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
