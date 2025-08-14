import db from '../../../lib/mongodb';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  await db;
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).end();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id).populate('courses');
    res.status(200).json({ username: user.username, email: user.email, courses: user.courses });
  } catch (err) {
    res.status(401).end();
  }
}
