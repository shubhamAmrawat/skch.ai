import mongoose from 'mongoose';

const sketchSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    title: {
      type: String,
      default: 'Untitled Sketch',
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Code is required'],
    },
    tldrawSnapshot: {
      type: String,
      default: null,
    },
    thumbnail: {
      type: String,
      default: null,
    },
    visibility:{
      type: String,
      enum: ['public', 'private'],
      default: 'private',
    },
    conversationHistory: {
      type: [
        {
          role: { type: String, enum: ['user', 'assistant'], required: true },
          content: { type: String, required: true },
          timestamp: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for efficient user sketch listing
sketchSchema.index({ userId: 1, createdAt: -1 });

const Sketch = mongoose.model('Sketch', sketchSchema);

export default Sketch;
