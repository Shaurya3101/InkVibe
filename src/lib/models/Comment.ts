import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComment extends Document {
  blog_id: mongoose.Types.ObjectId;
  blog_author: mongoose.Types.ObjectId;
  comment: string;
  commented_by: mongoose.Types.ObjectId;
  parent_comment?: mongoose.Types.ObjectId;
  children: mongoose.Types.ObjectId[];
  isReply: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>({
  blog_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'Blog', 
    required: true, 
    index: true 
  },
  blog_author: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  comment: { 
    type: String, 
    required: true 
  },
  commented_by: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  parent_comment: { 
    type: Schema.Types.ObjectId, 
    ref: 'Comment', 
    default: null, 
    index: true 
  },
  children: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Comment', 
    default: [] 
  }],
  isReply: { 
    type: Boolean, 
    default: false 
  },
}, {
  timestamps: true
});

const Comment: Model<IComment> = mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);
export default Comment;
