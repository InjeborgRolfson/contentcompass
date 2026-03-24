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
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  description_en: {
    type: String,
    default: null,
  },
  description_tr: {
    type: String,
    default: null,
  },
  why: {
    type: String,
    required: false,
  },
  why_en: {
    type: String,
    default: null,
  },
  why_tr: {
    type: String,
    default: null,
  },
  photo: {
    type: String,
    default: null,
  },
  tags: {
    type: [String],
    default: [],
  },
  isWildcard: {
    type: Boolean,
    default: false,
  },
  savedFrom: {
    type: String,
    enum: ['library', 'discover'],
    default: 'discover',
  },
}, { timestamps: true });

const Recommendation = models.Recommendation || model('Recommendation', RecommendationSchema);

export default Recommendation;
