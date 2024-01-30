import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
  {
    photo: {
      type: Schema.Types.ObjectId,
      ref: "Photo",
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Like = mongoose.model("Like", likeSchema);
