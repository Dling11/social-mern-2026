import { Schema, Types, model } from 'mongoose'

export interface PostCommentDocument {
  _id: Types.ObjectId
  user: Types.ObjectId
  content: string
  createdAt: Date
  updatedAt: Date
}

export interface PostDocument {
  author: Types.ObjectId
  content: string
  imageUrl?: string | null
  imagePublicId?: string | null
  likes: Types.ObjectId[]
  comments: Types.DocumentArray<PostCommentDocument>
  createdAt: Date
  updatedAt: Date
}

const postCommentSchema = new Schema<PostCommentDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  },
)

const postSchema = new Schema<PostDocument>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 1200,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    imagePublicId: {
      type: String,
      default: null,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [postCommentSchema],
  },
  {
    timestamps: true,
  },
)

export const PostModel = model<PostDocument>('Post', postSchema)
