'use server';

import mongoose, { Schema, model, models } from 'mongoose';
import { ContentType } from '@/types/content';

const FavoriteSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['Book', 'Movie', 'Tv Show', 'Podcast', 'Music', 'Game', 'Article', 'Youtube', 'Other'],
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
  note: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
    default: null,
  },
  tags: {
    type: [String],
    default: [],
  },
}, { timestamps: true });

const Favorite = models.Favorite || model('Favorite', FavoriteSchema);

export default Favorite;
