import * as dotenv from "dotenv";
import Mongoose from "mongoose";
import * as mongooseSeeder from "mais-mongoose-seeder";
import bcrypt from "bcryptjs";
import { seedData } from "./seed-data.js";


const seedLib = mongooseSeeder.default;

async function seed() {
  const seeder = seedLib(Mongoose);
  
  const seedDataCopy = JSON.parse(JSON.stringify(seedData));
  
  if (seedDataCopy.users) {
    const userEntries = Object.entries(seedDataCopy.users);

    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of userEntries) {
      // eslint-disable-next-line no-continue
      if (key === "_model") continue;

      const user = value;
      if (user.password) {
        // eslint-disable-next-line no-await-in-loop
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }

  const dbData = await seeder.seed(seedDataCopy, {
    dropDatabase: false,
    dropCollections: true,
  });
  console.log(dbData);
}


export function connectMongo() {
  dotenv.config();

  Mongoose.set("strictQuery", true);
  Mongoose.connect(process.env.db);
  const db = Mongoose.connection;

  db.on("error", (err) => {
    console.log(`database connection error: ${err}`);
  });

  db.on("disconnected", () => {
    console.log("database disconnected");
  });

  db.once("open", function() {
    console.log(`database connected to ${this.name} on ${this.host}`);

    if (process.env.NODE_ENV !== "test") {
      seed();
    }
  });
}
