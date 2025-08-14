import db from '../../../lib/mongodb';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  await db;
  if (req.method !== 'POST') return res.status(405).end();

  const { name, email, password, tos } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  if (!tos) {
    return res.status(400).json({ message: 'Terms must be accepted' });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    await User.create({ username: name, email, password: hashed });
    res.status(201).json({ message: 'Account created' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    res.status(500).json({ message: 'Registration error' });
  }
}
