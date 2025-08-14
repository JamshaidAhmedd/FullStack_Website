import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  answer: String,
});

const QuizSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  questions: [QuestionSchema],
});

export default mongoose.models.Quiz || mongoose.model('Quiz', QuizSchema);
