import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  type: 'like' | 'comment' | 'reply' | 'follow';
  blog?: mongoose.Types.ObjectId;
  notification_for: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId; // The user who performed the action
  comment?: mongoose.Types.ObjectId;
  seen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  type: { 
    type: String, 
    required: true, 
    enum: ['like', 'comment', 'reply', 'follow'] 
  },
  blog: { 
    type: Schema.Types.ObjectId, 
    ref: 'Blog', 
    index: true 
  },
  notification_for: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  comment: { 
    type: Schema.Types.ObjectId, 
    ref: 'Comment' 
  },
  seen: { 
    type: Boolean, 
    default: false, 
    index: true 
  },
}, {
  timestamps: true
});

const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
export default Notification;
