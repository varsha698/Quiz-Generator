import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    bio: String
  },
  stats: {
    totalQuizzes: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    quizzesCreated: { type: Number, default: 0 },
    badges: [{ type: String }],
    level: { type: Number, default: 1 },
    experience: { type: Number, default: 0 }
  },
  preferences: {
    theme: { type: String, default: 'dark' },
    notifications: { type: Boolean, default: true },
    publicProfile: { type: Boolean, default: true }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
  return {
    _id: this._id,
    username: this.username,
    profile: this.profile,
    stats: this.stats,
    preferences: {
      publicProfile: this.preferences.publicProfile
    },
    createdAt: this.createdAt
  };
};

export default mongoose.model('User', userSchema);
