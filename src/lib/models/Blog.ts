import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  banner?: string;
  des?: string;
  content: string; // JSON string from TipTap editor
  tags: string[];
  author: mongoose.Types.ObjectId;
  slug: string;
  likes: mongoose.Types.ObjectId[];
  totalLikes: number;
  totalComments: number;
  views: number;
  draft: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>({
  title: { 
    type: String, 
    required: true 
  },
  banner: { 
    type: String, 
    default: '' 
  },
  des: { 
    type: String, 
    default: '' 
  },
  content: { 
    type: String, 
    required: true 
  },
  tags: [{ 
    type: String, 
    index: true 
  }],
  author: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  likes: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    default: [] 
  }],
  totalLikes: { 
    type: Number, 
    default: 0 
  },
  totalComments: { 
    type: Number, 
    default: 0 
  },
  views: { 
    type: Number, 
    default: 0 
  },
  draft: { 
    type: Boolean, 
    default: true, 
    index: true 
  },
  publishedAt: { 
    type: Date 
  },
}, {
  timestamps: true
});

// Create text index on title and des for full-text search capability
BlogSchema.index({ title: 'text', des: 'text' });

const Blog: Model<IBlog> = mongoose.models.Blog || mongoose.model<IBlog>('Blog', BlogSchema);
export default Blog;
