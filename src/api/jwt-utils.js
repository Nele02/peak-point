import jwt from "jsonwebtoken";
import { db } from "../models/db.js";

export function createToken(user) {
  const payload = {
    id: user._id,
    email: user.email,
  };
  const options = {
    algorithm: "HS256",
    expiresIn: "1h",
  };
  return jwt.sign(payload, process.env.cookie_password, options);
}

export function decodeToken(token) {
  const userInfo = {};
  try {
    const decoded = jwt.verify(token, process.env.cookie_password);
    userInfo.userId = decoded.id;
    userInfo.email = decoded.email;
  } catch (e) {
    console.log(e.message);
  }
  return userInfo;
}

export async function validate(decoded, request) {
  const user = await db.userStore.getUserById(decoded.id);
  if (!user) {
    return { isValid: false };
  }

  const isAdmin = (user.email === process.env.ADMIN_EMAIL && user.password === process.env.ADMIN_PASSWORD);
  user.isAdmin = isAdmin;
  user.scope = isAdmin ? ["admin"] : ["user"];

  return { isValid: true, credentials: user };
}
