import mongoose from "mongoose";
import { Photo } from "../models/photo.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";

const getProfileStats = asyncHandler(async (req, res) => {
  // get userId
  const userId = req.user._id;

  // find profile stats
  const profileStats = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "photos",
        localField: "_id",
        foreignField: "owner",
        as: "photos",
      },
    },
    {
      $addFields: {
        photoCount: {
          $size: "$photos",
        },
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "photos._id",
        foreignField: "photo",
        as: "likes",
      },
    },
    {
      $addFields: {
        likeCount: { $size: "$likes" },
      },
    },
    {
      $lookup: {
        from: "sets",
        localField: "_id",
        foreignField: "owner",
        as: "sets",
      },
    },
    {
      $addFields: {
        setCount: {
          $size: "$sets",
        },
      },
    },
    {
      $project: {
        photoCount: 1,
        setCount: 1,
        totalLikeCount: {
          $sum: "$likeCount",
        },
      },
    },
  ]);

  // check if no stats found
  if (profileStats.length === 0) {
    return res.status(404).json(new ApiError(404, null, "No stats available"));
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        profileStats[0],
        "Profile stats fetched successfully"
      )
    );
});

const getProfilePhotos = asyncHandler(async (req, res) => {
  // get userId
  const userId = req.user._id;

  // find all the photos uploaded by the user
  const allPhotos = await Photo.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "photo",
        as: "likes",
      },
    },
    {
      $addFields: {
        likeCount: {
          $size: "$likes",
        },
      },
    },
    {
      $project: {
        title: 1,
        description: 1,
        photo_url: 1,
        likeCount: 1,
        isPublic: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  // check photo
  if (!allPhotos || allPhotos.length == 0) {
    throw new ApiError(404, "Photos not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, { photos: allPhotos }, "Photos fetched successfully")
    );
});

export { getProfileStats, getProfilePhotos };
