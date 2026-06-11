import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  password?: string;
  avatar?: string;
  bio?: string;
  social_links?: {
    github?: string;
    twitter?: string;
    website?: string;
    instagram?: string;
  };
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  bookmarks: mongoose.Types.ObjectId[];
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { 
    type: String, 
    required: true 
  },
  username: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  password: { 
    type: String 
  },
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
  },
  avatar: { 
    type: String, 
    default: '' 
  },
  bio: { 
    type: String, 
    default: '' 
  },
  social_links: {
    github: { type: String, default: '' },
    twitter: { type: String, default: '' },
    website: { type: String, default: '' },
    instagram: { type: String, default: '' },
  },
  followers: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    default: [] 
  }],
  following: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    default: [] 
  }],
  bookmarks: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Blog', 
    default: [] 
  }],
}, {
  timestamps: true
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
