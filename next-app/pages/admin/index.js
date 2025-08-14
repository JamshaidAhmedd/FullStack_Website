import { useEffect, useState } from 'react';

export default function Admin() {
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState('');

  useEffect(() => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => setCourses(data));
  }, []);

  async function addCourse(e) {
    e.preventDefault();
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    const data = await res.json();
    setCourses([...courses, data]);
    setTitle('');
  }

  return (
    <main>
      <h1>Admin Dashboard</h1>
      <form onSubmit={addCourse}>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder='Course title' />
        <button type='submit'>Add Course</button>
      </form>
      <ul>
        {courses.map(c => <li key={c._id}>{c.title}</li>)}
      </ul>
    </main>
  );
}
