const express = require('express');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().populate('quizzes');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get single course
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('quizzes');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create new course (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { title, description, videos } = req.body;
  try {
    const course = new Course({ title, description, videos });
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update course (admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { title, description, videos } = req.body;
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    course.title = title || course.title;
    course.description = description || course.description;
    course.videos = videos || course.videos;
    await course.save();
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete course (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    // Optionally remove associated quizzes
    await Quiz.deleteMany({ course: course._id });
    await course.remove();
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;