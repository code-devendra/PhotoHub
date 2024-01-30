import mongoose, { isValidObjectId } from "mongoose";
import { Set } from "../models/set.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Photo } from "../models/photo.models.js";
import { User } from "../models/user.models.js";

const createSet = asyncHandler(async (req, res) => {
  // get title and description
  const { title, description } = req.body;

  if (
    !title ||
    title.trim() == "" ||
    !description ||
    description.trim() == ""
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // create set
  const set = await Set.create({ title, description, owner: req.user?._id });

  // check if set created
  if (!set) {
    throw new ApiError(500);
  }

  res.status(201).json(new ApiResponse(201, set, "Set created successfully"));
});

const getUserSets = asyncHandler(async (req, res) => {
  // get userId
  const { userId } = req.params;

  if (
    !isValidObjectId(userId) ||
    userId.toString() != req.user._id.toString()
  ) {
    throw new ApiError(400, "Invalid userId");
  }

  // find user
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // find all sets
  const sets = await Set.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "photos",
        localField: "_id",
        foreignField: "setBelongsTo",
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
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        photoCount: 1,
        createdAt: 1,
      },
    },
  ]);

  res.status(200).json(new ApiResponse(200, sets, "Sets fetched successfully"));
});

const getSetById = asyncHandler(async (req, res) => {
  // get setId
  const { setId } = req.params;

  if (!isValidObjectId(setId)) {
    throw new ApiError(400, "Invalid setId");
  }

  // find set
  const set = await Set.findOne({ _id: setId, owner: req.user._id });

  if (!set) {
    throw new ApiError(404, "Set not found");
  }

  // find set details
  const setDetails = await Set.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(setId),
        owner: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "photos",
        localField: "_id",
        foreignField: "setBelongsTo",
        as: "photos",
        pipeline: [
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
            },
          },
        ],
      },
    },
    {
      $addFields: {
        photos: "$photos",
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        owner: 1,
        photos: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, setDetails[0], "Set fetched successfully"));
});

const addPhotoToSet = asyncHandler(async (req, res) => {
  // get setId
  const { setId, photoId } = req.params;

  if (!isValidObjectId(setId) || !isValidObjectId(photoId)) {
    throw new ApiError(400, "Invalid set or photo id");
  }

  // find set
  const set = await Set.findOne({ _id: setId, owner: req.user._id });

  if (!set) {
    throw new ApiError(404, "Set not found");
  }

  // find photo
  const photo = await Photo.findOne({ _id: photoId, owner: req.user._id });

  if (!photo) {
    throw new ApiError(404, "Photo not found");
  }

  if (photo.setBelongsTo) {
    throw new ApiError(400, "Photo is already in another set");
  }

  // give set reference
  photo.setBelongsTo = setId;

  await photo.save();

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Photo added to the set successfully"));
});

const removePhotoFromSet = asyncHandler(async (req, res) => {
  // get setId and photoId
  const { setId, photoId } = req.params;

  if (!isValidObjectId(setId) || !isValidObjectId(photoId)) {
    throw new ApiError(400, "Invalid set or photo id");
  }

  // find set
  const set = await Set.findOne({ _id: setId, owner: req.user._id });

  if (!set) {
    throw new ApiError(404, "Set not found");
  }

  // find photo
  const photo = await Photo.findOne({
    _id: photoId,
    owner: req.user._id,
    setBelongsTo: setId,
  });

  if (!photo) {
    throw new ApiError(404, "Photo not found");
  }

  await Photo.updateOne(
    { _id: photoId, setBelongsTo: setId },
    {
      $unset: {
        setBelongsTo: 1,
      },
    }
  );

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Photo removed from set successfully"));
});

const deleteSet = asyncHandler(async (req, res) => {
  // get setId
  const { setId } = req.params;

  if (!isValidObjectId(setId)) {
    throw new ApiError(400, "Invalid set");
  }

  // find set
  const set = await Set.findOne({ _id: setId, owner: req.user._id });

  if (!set) {
    throw new ApiError(404, "Set not found");
  }

  // delete set
  await Set.deleteOne({ _id: setId });

  // delete set reference from set photos
  await Photo.updateMany(
    {
      setBelongsTo: setId,
    },
    {
      $unset: {
        setBelongsTo: 1,
      },
    }
  );

  res.status(200).json(new ApiResponse(200, {}, "Set deleted successfully"));
});

const updateSet = asyncHandler(async (req, res) => {
  // get setId, title and description
  const { setId } = req.params;
  const { title, description } = req.body;

  if (!isValidObjectId(setId)) {
    throw new ApiError(400, "Invalid setId");
  }

  if (
    !title ||
    title.trim() === "" ||
    !description ||
    description.trim() === ""
  ) {
    throw new ApiError(400, "All details are required");
  }

  // find set
  const set = await Set.findOne({ _id: setId, owner: req.user._id });

  if (!set) {
    throw new ApiError(404, "Set not found");
  }

  // update details
  set.title = title;
  set.description = description;

  await set.save();

  res.status(200).json(new ApiResponse(200, set, "Set updated successfully"));
});

export {
  createSet,
  getUserSets,
  getSetById,
  addPhotoToSet,
  removePhotoFromSet,
  deleteSet,
  updateSet,
};
