"use server";

import mongoose, { Schema, model, models } from "mongoose";
import { ContentType } from "@/types/content";

const FavoriteSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "Book",
        "Movie",
        "Tv Show",
        "Podcast",
        "Music",
        "Game",
        "Creator",
        "Article",
        "Youtube",
        "Painting",
        "Other",
      ],
      required: false,
    },
    title: {
      type: String,
      required: true,
    },
    creator: {
      type: String,
      required: false,
    },
    year: {
      type: String,
      required: false,
    },
    note: {
      type: String,
      required: false,
    },
    photo: {
      type: String,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
    isCreator: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Favorite = models.Favorite || model("Favorite", FavoriteSchema);

export default Favorite;
