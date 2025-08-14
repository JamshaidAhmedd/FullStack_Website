import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
