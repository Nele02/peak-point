import Mongoose from "mongoose";

const { Schema } = Mongoose;

const imageSchema = new Schema(
  {
    url: String,
    publicId: String,
  },
  { _id: false }
);

const peakSchema = new Schema({
  name: String,
  description: String,
  elevation: Number,
  lat: Number,
  lng: Number,

  images: {
    type: [imageSchema],
    default: [],
  },

  categories: [
    {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
  ],
  userid: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

export const Peak = Mongoose.model("Peak", peakSchema);
