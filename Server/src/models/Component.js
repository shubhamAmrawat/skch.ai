import mongoose from 'mongoose';

const componentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
      default: '',
    },
    category: {
      type: String,
      required: true,
      enum: [
        'auth',
        'navbar',
        'hero',
        'cards',
        'pricing',
        'footer',
        'buttons',
        'dashboard',
        'forms',
        'tables',
        'modals',
        'sidebars',
        'profiles',
        'settings',
        'notifications',
        'testimonials',
        'faq',
        'cta',
        'stats',
        'ecommerce',
        'blog',
        'error',
        'onboarding',
        'charts',
        'contact',
        'team',
        'features',
        'timeline',
      ],
      index: true,
    },
    code: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

componentSchema.index({ category: 1, order: 1 });

const Component = mongoose.model('Component', componentSchema);
export default Component;