import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const togglePhotoLike = asyncHandler(async (req, res) => {
  // get photoId
  const { photoId } = req.params;
  if (!photoId || photoId.trim() == "") {
    throw new ApiError(400, "photoId is missing");
  }
  if (!isValidObjectId(photoId)) {
    throw new ApiError(400, "Invalid photoId");
  }
  // get userId
  const userId = req.user._id;

  const isLiked = await Like.findOne({ likedBy: userId, photo: photoId });
  if (isLiked) {
    // If there's a like, delete it
    await Like.deleteOne({ likedBy: userId, photo: photoId });
  } else {
    // If there's no like, create a new one
    await Like.create({ likedBy: userId, photo: photoId });
  }

  res.status(200).json(new ApiResponse(200, "Like toggle successfully"));
});

const getLikedPhotos = asyncHandler(async (req, res) => {
  // getUserId
  const userId = req.user._id;

  // find all liked photos
  const allLikedPhotos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "photos",
        localField: "photo",
        foreignField: "_id",
        as: "photo",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
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
              _id: 1,
              title: 1,
              description: 1,
              photo_url: 1,
              isPublic: 1,
              likeCount: 1,
              createdAt: 1,
              updatedAt: 1,
              owner: {
                $arrayElemAt: ["$owner", 0],
              },
            },
          },
        ],
      },
    },
    {
      $project: {
        photo: {
          $arrayElemAt: ["$photo", 0],
        },
      },
    },
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, allLikedPhotos, "Photos fetched successfully"));
});

export { togglePhotoLike, getLikedPhotos };
