import mongoose from "mongoose";
import { Photo } from "../models/photo.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

//TODO: get all photos based on query, sort, pagination
const getAllPhotos = asyncHandler(async (req, res) => {
  // get filter parameter from req.query
  let {
    page = 1,
    limit = 10,
    query = "",
    sortBy = "createdAt",
    sortType = 1,
  } = req.query;
  sortType = Number(sortType);
  limit = Number(limit);
  page = Number(page);
  const skipCount = limit * (page - 1);

  // apply some validations

  if (limit < 1) {
    throw new ApiError(400, "limit must be positive");
  }
  if (page < 1) {
    throw new ApiError(400, "page no. must be positive");
  }
  if (sortBy !== "createdAt" && sortBy !== "likeCount") {
    throw new ApiError(
      400,
      "Invalid sort measure. you can only sort by either createdAt or likeCount"
    );
  }
  if (sortType !== -1 && sortType !== 1) {
    throw new ApiError(
      400,
      "Invalid sort type. Either enter 1 for ASC and -1 for DESC order"
    );
  }

  // find photos
  const photos = await Photo.aggregate([
    {
      $match: {
        isPublic: true,
        $or: [
          {
            title: new RegExp(query, "i"),
          },
          {
            description: new RegExp(query, "i"),
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
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        photo_url: 1,
        likeCount: 1,
        owner: {
          $arrayElemAt: ["$owner", 0],
        },
        createdAt: 1,
        updatedAt: 1,
      },
    },
    {
      $sort: {
        [sortBy]: sortType,
      },
    },
    {
      $skip: skipCount,
    },
    {
      $limit: limit,
    },
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, photos, "photos fetched successfully"));
});

const createPhoto = asyncHandler(async (req, res) => {
  // get the data
  const { title, description, isPublic } = req.body;

  if (!title || title.trim() === "") {
    throw new ApiError(400, "Title is required");
  }
  // get file path
  const photoLocalPath = req.file?.path;
  if (!photoLocalPath) {
    throw new ApiError(400, "Photo is required");
  }

  // upload photo
  const photoResponse = await uploadOnCloudinary(photoLocalPath);
  if (!photoResponse.url) {
    throw new ApiError(400, "Error while uploading on photo");
  }

  // store photo details
  const photo = await Photo.create({
    title,
    description: description || "",
    photo_url: photoResponse.url,
    isPublic: isPublic || true,
    owner: req.user._id,
  });

  // if photo not created
  if (!photo) {
    throw new ApiError(500);
  }

  res
    .status(201)
    .json(new ApiResponse(201, photo, "Photo created successfully"));
});

const getPhotoById = asyncHandler(async (req, res) => {
  // get photoId
  const { photoId } = req.params;
  if (!photoId || photoId.trim() == "") {
    throw new ApiError(400, "photoId is missing");
  }

  // get photo details
  const photoDetails = await Photo.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(photoId),
      },
    },
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
        createdAt: 1,
        updatedAt: 1,
        likeCount: 1,
        owner: {
          $arrayElemAt: ["$owner", 0],
        },
      },
    },
  ]);

  // check photo
  if (
    !photoDetails ||
    photoDetails.length == 0 ||
    (photoDetails[0].isPublic == false &&
      req.user?._id.toString() != photoDetails[0].owner._id.toString())
  ) {
    throw new ApiError(404, "Photo not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, photoDetails[0], "Photo fetched Successfully"));
});

const updatePhoto = asyncHandler(async (req, res) => {
  // get photoId and title,description
  const { photoId } = req.params;
  const { title, description } = req.body;

  // check photoId and title
  if (!photoId || photoId.trim() == "") {
    throw new ApiError(400, "photoId is missing");
  }
  if (!title || title.trim() === "") {
    throw new ApiError(400, "Title is required");
  }

  // find photo
  const photo = await Photo.findById(photoId);

  if (!photo) {
    throw new ApiError(400, "Invalid photoId");
  }

  if (photo.owner?.toString() != req.user?._id?.toString()) {
    throw new ApiError(401, "Invalid user");
  }

  // get file path and update new photo if exist
  const photoLocalPath = req.file?.path;
  if (photoLocalPath) {
    const photoResponse = await uploadOnCloudinary(photoLocalPath);
    if (!photoResponse.url) {
      throw new ApiError(400, "Error while uploading new photo");
    }
    await deleteFromCloudinary(photo.photo_url);
    photo.photo_url = photoResponse.url;
  }

  // update title and description
  photo.title = title;
  photo.description = description;

  // save changes
  await photo.save();

  res
    .status(200)
    .json(new ApiResponse(200, photo, "Photo updated successfully"));
});

const deletePhoto = asyncHandler(async (req, res) => {
  // get photoId
  const { photoId } = req.params;
  if (!photoId || photoId.trim() == "") {
    throw new ApiError(400, "photoId is missing");
  }

  // find photo
  const photo = await Photo.findById(photoId);

  if (!photo) {
    throw new ApiError(400, "Invalid photoId");
  }
  if (photo.owner?.toString() != req.user?._id?.toString()) {
    throw new ApiError(401, "Invalid user");
  }

  // delete photo file from cloudinary
  await deleteFromCloudinary(photo.photo_url);

  // delete photo document
  await Photo.findByIdAndDelete(photoId);

  res.status(200).json(new ApiResponse(200, {}, "Photo deleted successfully"));
});

const togglePublicStatus = asyncHandler(async (req, res) => {
  // get photo
  const { photoId } = req.params;

  if (!photoId || photoId.trim() == "") {
    throw new ApiError(400, "photoId is missing");
  }

  // find photo
  const photo = await Photo.findOne({ _id: photoId, owner: req.user?._id });

  if (!photo) {
    throw new ApiError(404, "photo not found");
  }

  // change isPublic mode
  photo.isPublic = !photo.isPublic;

  // save changes
  await photo.save();

  res
    .status(200)
    .json(new ApiResponse(200, photo, "photo status changed successfully "));
});

export {
  getAllPhotos,
  createPhoto,
  getPhotoById,
  updatePhoto,
  deletePhoto,
  togglePublicStatus,
};
