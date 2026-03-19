'use server';

import mongoose, { Schema, model, models } from 'mongoose';

const SeenContentSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  seenAt: {
    type: Date,
    default: Date.now,
  },
});

const SeenContent = models.SeenContent || model('SeenContent', SeenContentSchema);

export default SeenContent;
