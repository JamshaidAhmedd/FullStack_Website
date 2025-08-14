import { useEffect, useState } from 'react';

export default function Home() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => setCourses(data));
  }, []);

  return (
    <main>
      <h1>EduPlatform</h1>
      <ul>
        {courses.map(course => (
          <li key={course._id}>{course.title}</li>
        ))}
      </ul>
    </main>
  );
}
