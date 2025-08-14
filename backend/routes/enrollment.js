const express = require('express');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Enroll in a course
router.post('/:courseId', authMiddleware, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    // Check if already enrolled
    const existing = await Enrollment.findOne({ user: req.user._id, course: req.params.courseId });
    if (existing) {
      return res.status(400).json({ message: 'Already enrolled' });
    }
    const enrollment = new Enrollment({ user: req.user._id, course: req.params.courseId });
    await enrollment.save();
    res.status(201).json(enrollment);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get user enrollments
router.get('/', authMiddleware, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id })
      .populate('course')
      .populate('completedQuizzes');
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update progress manually (optional)
router.put('/:courseId/progress', authMiddleware, async (req, res) => {
  const { progress } = req.body;
  try {
    const enrollment = await Enrollment.findOne({ user: req.user._id, course: req.params.courseId });
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    enrollment.progress = Math.min(100, Math.max(0, progress));
    if (enrollment.progress >= 100) {
      enrollment.completed = true;
    }
    await enrollment.save();
    res.json(enrollment);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;