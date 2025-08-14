import db from '../../../lib/mongodb';
import Course from '../../../models/Course';

export default async function handler(req, res) {
  await db;
  if (req.method === 'GET') {
    const courses = await Course.find();
    return res.status(200).json(courses);
  }
  if (req.method === 'POST') {
    const course = await Course.create(req.body);
    return res.status(201).json(course);
  }
  res.status(405).end();
}
