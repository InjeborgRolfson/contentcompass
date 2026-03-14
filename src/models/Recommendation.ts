'use server';

import mongoose, { Schema, model, models } from 'mongoose';

const RecommendationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  creator: {
    type: String,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  why: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
}, { timestamps: true });

const Recommendation = models.Recommendation || model('Recommendation', RecommendationSchema);

export default Recommendation;
