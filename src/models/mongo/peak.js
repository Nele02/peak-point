import Mongoose from "mongoose";

const { Schema } = Mongoose;

const PeakSchema = new Schema({
  name: String,
  description: String,
  lat: Number,
  lon: Number,
});

export const Peak = Mongoose.model("Peak", PeakSchema);