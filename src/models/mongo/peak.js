import Mongoose from "mongoose";

const { Schema } = Mongoose;

const peakSchema = new Schema({
  name: String,
  description: String,
  elevation: Number,
  lat: Number,
  lng: Number,
  images: {
    type: [String],
    default: [],
  },
  userid: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

export const Peak = Mongoose.model("Peak", peakSchema);