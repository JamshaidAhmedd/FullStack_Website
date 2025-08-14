const express = require('express');
const Quiz = require('../models/Quiz');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get quizzes by course
router.get('/course/:courseId', authMiddleware, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ course: req.params.courseId });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create quiz for course (admin only)
router.post('/course/:courseId', authMiddleware, adminMiddleware, async (req, res) => {
  const { questions } = req.body;
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    const quiz = new Quiz({ course: course._id, questions });
    await quiz.save();
    // Add quiz to course quizzes list
    course.quizzes.push(quiz._id);
    await course.save();
    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Submit quiz (user)
router.post('/:quizId/submit', authMiddleware, async (req, res) => {
  const { answers } = req.body; // array of selected option indexes
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    let score = 0;
    quiz.questions.forEach((q, index) => {
      if (answers && answers[index] === q.correctAnswer) {
        score += 1;
      }
    });
    // update enrollment progress and completed quizzes
    // find enrollment for user and quiz's course
    const enrollment = await Enrollment.findOne({ user: req.user._id, course: quiz.course });
    if (enrollment) {
      // Add quiz to completedQuizzes if not already
      const alreadyCompleted = enrollment.completedQuizzes.some(qId => qId.equals(quiz._id));
      if (!alreadyCompleted) {
        enrollment.completedQuizzes.push(quiz._id);
      }
      // update progress: simple algorithm: each quiz completes equal share
      // but we do not know number of quizzes; approximate: progress increases by 100/quizCount
      const totalQuizzes = await Quiz.countDocuments({ course: quiz.course });
      if (totalQuizzes > 0) {
        const progressStep = Math.floor(100 / totalQuizzes);
        enrollment.progress = Math.min(100, enrollment.progress + progressStep);
      }
      if (enrollment.progress >= 100) {
        enrollment.completed = true;
      }
      await enrollment.save();
    }
    res.json({ score, totalQuestions: quiz.questions.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;