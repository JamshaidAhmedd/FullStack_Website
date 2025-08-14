import mongoose from 'mongoose';

const EnrollmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  progress: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
});

export default mongoose.models.Enrollment || mongoose.model('Enrollment', EnrollmentSchema);
