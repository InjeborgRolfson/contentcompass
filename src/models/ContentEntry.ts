import { Schema, model, models } from "mongoose";

const ContentEntrySchema = new Schema(
  {
    type: { type: String, required: true },
    title: { type: String, required: true },
    creator: { type: String, default: "" },
    year: { type: String, default: "" },
    description_en: { type: String, default: "" },
    description_tr: { type: String, default: "" },
    photo: { type: String, default: null },
    tags: { type: [String], default: [] },
    slug: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

// Compound unique index to prevent duplicate content entries
ContentEntrySchema.index({ title: 1, type: 1 }, { unique: true });

const ContentEntry =
  models.ContentEntry || model("ContentEntry", ContentEntrySchema);

export default ContentEntry;
