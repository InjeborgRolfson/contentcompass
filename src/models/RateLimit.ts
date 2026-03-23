import mongoose, { Schema, model, models } from "mongoose";

const RateLimitSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    count: {
      type: Number,
      default: 0,
    },
    resetAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

// Index for automatic expiration if we wanted to use TTL,
// but we'll manage resets manually for more control over the user experience.
const RateLimit = models.RateLimit || model("RateLimit", RateLimitSchema);

export default RateLimit;
