import Mongoose from "mongoose";

const { Schema } = Mongoose;

const peakSchema = new Schema({
  name: String,
  description: String,
  lat: Number,
  lng: Number,
  userid: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

export const Peak = Mongoose.model("Peak", peakSchema);