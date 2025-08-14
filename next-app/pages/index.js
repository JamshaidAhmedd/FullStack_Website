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
      <section className="hero">
        <h1>My Academy</h1>
        <p>Empowering learners worldwide with engaging courses.</p>
        <a className="cta" href="/signup">Get Started</a>
      </section>

      <section className="courses">
        <h2>Featured Courses</h2>
        <ul>
          {courses.map(course => (
            <li key={course._id}>{course.title}</li>
          ))}
        </ul>
      </section>

      <section className="categories">
        <h2>Categories</h2>
        <div className="grid">
          <div className="card">Science</div>
          <div className="card">Technology</div>
          <div className="card">Business</div>
          <div className="card">Arts</div>
        </div>
      </section>

      <section className="events">
        <h2>Upcoming Events</h2>
        <ul>
          <li>Webinar: Learning Strategies - July 10</li>
          <li>Bootcamp: Intro to JS - Aug 5</li>
        </ul>
      </section>

      <section className="testimonials">
        <h2>Testimonials</h2>
        <blockquote>
          "This academy transformed my career!" - Happy Student
        </blockquote>
      </section>

      <footer className="footer">
        <p>© {new Date().getFullYear()} My Academy</p>
        <div className="socials">
          <a href="https://twitter.com">Twitter</a>
          <a href="https://facebook.com">Facebook</a>
          <a href="https://instagram.com">Instagram</a>
        </div>
      </footer>
    </main>
  );
}
