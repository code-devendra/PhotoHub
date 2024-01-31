import mongoose, { Schema } from "mongoose";

const photoSchema = new Schema(
  {
    photo_url: {
      type: String, // cloudinary url
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    setBelongsTo: {
      type: Schema.Types.ObjectId,
      ref: "Set",
    },
  },
  {
    timestamps: true,
  }
);

export const Photo = mongoose.model("Photo", photoSchema);
