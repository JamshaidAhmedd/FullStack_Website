// Entry point for the education platform frontend

const API_BASE = 'http://localhost:5000/api';

function Navigation({ user, setPage, handleLogout }) {
  return (
    <nav className="navbar">
      <div>
        <a href="#" onClick={() => setPage('home')}>Home</a>
        <a href="#" onClick={() => setPage('courses')}>Courses</a>
        {user && <a href="#" onClick={() => setPage('dashboard')}>Dashboard</a>}
        {user && user.role === 'admin' && <a href="#" onClick={() => setPage('admin')}>Admin</a>}
      </div>
      <div>
        {user ? (
          <a href="#" onClick={handleLogout}>Logout ({user.username})</a>
        ) : (
          <>
            <a href="#" onClick={() => setPage('login')}>Login</a>
            <a href="#" onClick={() => setPage('register')}>Register</a>
          </>
        )}
      </div>
    </nav>
  );
}

function HomePage({ setPage }) {
  return (
    <div className="container">
      <h1>Welcome to the Education Platform</h1>
      <p>Browse our courses, enroll and track your learning progress.</p>
      <button onClick={() => setPage('courses')}>Explore Courses</button>
    </div>
  );
}

function CoursesPage({ token, setPage, setCurrentCourseId, handleEnroll }) {
  const [courses, setCourses] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  React.useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await axios.get(`${API_BASE}/courses`);
        setCourses(res.data);
      } catch (err) {
        setError('Failed to load courses');
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);
  return (
    <div className="container">
      <h2>Available Courses</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {courses.map((course) => (
        <div className="card" key={course._id}>
          <h3>{course.title}</h3>
          <p>{course.description}</p>
          <button onClick={() => { setCurrentCourseId(course._id); setPage('course'); }}>View Details</button>
          {token && (
            <button style={{ marginLeft: '0.5rem' }} onClick={() => handleEnroll(course._id)}>Enroll</button>
          )}
        </div>
      ))}
    </div>
  );
}

function CoursePage({ courseId, token }) {
  const [course, setCourse] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [quizToTake, setQuizToTake] = React.useState(null);
  const [scoreResult, setScoreResult] = React.useState(null);
  const [answers, setAnswers] = React.useState([]);
  React.useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await axios.get(`${API_BASE}/courses/${courseId}`);
        setCourse(res.data);
      } catch (err) {
        setError('Failed to load course');
      } finally {
        setLoading(false);
      }
    }
    if (courseId) fetchCourse();
  }, [courseId]);
  const startQuiz = async (quizId) => {
    try {
      const res = await axios.get(`${API_BASE}/quizzes/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const quiz = res.data.find((q) => q._id === quizId);
      setQuizToTake(quiz);
      setAnswers(new Array(quiz.questions.length).fill(null));
      setScoreResult(null);
    } catch (err) {
      alert('Failed to load quiz');
    }
  };
  const submitQuiz = async () => {
    try {
      const res = await axios.post(
        `${API_BASE}/quizzes/${quizToTake._id}/submit`,
        { answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setScoreResult(res.data);
      setQuizToTake(null);
    } catch (err) {
      alert('Failed to submit quiz');
    }
  };
  if (loading) return <div className="container"><p>Loading...</p></div>;
  if (error) return <div className="container"><p className="error">{error}</p></div>;
  if (!course) return <div className="container"><p>Course not found</p></div>;
  return (
    <div className="container">
      <h2>{course.title}</h2>
      <p>{course.description}</p>
      <h3>Videos</h3>
      {course.videos && course.videos.length ? (
        <ul>
          {course.videos.map((v, idx) => (
            <li key={idx}><a href={v} target="_blank" rel="noreferrer">Video {idx + 1}</a></li>
          ))}
        </ul>
      ) : (
        <p>No videos available.</p>
      )}
      <h3>Quizzes</h3>
      {course.quizzes && course.quizzes.length ? (
        <ul>
          {course.quizzes.map((quiz) => (
            <li key={quiz._id}>
              Quiz {quiz.questions.length} questions
              {token && <button style={{ marginLeft: '0.5rem' }} onClick={() => startQuiz(quiz._id)}>Take Quiz</button>}
            </li>
          ))}
        </ul>
      ) : (
        <p>No quizzes yet.</p>
      )}
      {quizToTake && (
        <div className="card">
          <h4>Quiz</h4>
          {quizToTake.questions.map((q, index) => (
            <div key={index} style={{ marginBottom: '1rem' }}>
              <p>{index + 1}. {q.question}</p>
              {q.options.map((opt, idx) => (
                <label key={idx} style={{ display: 'block' }}>
                  <input
                    type="radio"
                    name={`q${index}`}
                    value={idx}
                    checked={answers[index] === idx}
                    onChange={() => {
                      const newAns = [...answers];
                      newAns[index] = idx;
                      setAnswers(newAns);
                    }}
                  /> {opt}
                </label>
              ))}
            </div>
          ))}
          <button onClick={submitQuiz}>Submit Quiz</button>
        </div>
      )}
      {scoreResult && (
        <div className="card">
          <h4>Quiz Result</h4>
          <p>You scored {scoreResult.score} out of {scoreResult.totalQuestions}.</p>
        </div>
      )}
    </div>
  );
}

function LoginPage({ handleLogin }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
      handleLogin(res.data);
    } catch (err) {
      setError('Invalid email or password');
    }
  };
  return (
    <div className="container">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={submit}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

function RegisterPage({ handleRegister }) {
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post(`${API_BASE}/auth/register`, { username, email, password });
      handleRegister(res.data);
    } catch (err) {
      setError('Registration failed');
    }
  };
  return (
    <div className="container">
      <h2>Register</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={submit}>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

function Dashboard({ user, token, setPage, setCurrentCourseId }) {
  const [enrollments, setEnrollments] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    async function fetchEnrollments() {
      try {
        const res = await axios.get(`${API_BASE}/enroll`, { headers: { Authorization: `Bearer ${token}` } });
        setEnrollments(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchEnrollments();
  }, [user, token]);
  return (
    <div className="container">
      <h2>{user && user.role === 'admin' ? 'Admin' : 'User'} Dashboard</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="dashboard">
          {enrollments.length === 0 ? (
            <p>You are not enrolled in any courses.</p>
          ) : (
            enrollments.map((enroll) => (
              <div className="card" key={enroll._id}>
                <h4>{enroll.course.title}</h4>
                <p>Progress: {enroll.progress}%</p>
                <p>Completed: {enroll.completed ? 'Yes' : 'No'}</p>
                <button onClick={() => { setCurrentCourseId(enroll.course._id); setPage('course'); }}>Go to Course</button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function AdminDashboard({ token }) {
  const [courses, setCourses] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showCourseForm, setShowCourseForm] = React.useState(false);
  const [showQuizForm, setShowQuizForm] = React.useState(null); // courseId for which quiz form is open
  React.useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await axios.get(`${API_BASE}/courses`);
        setCourses(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);
  const deleteCourse = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await axios.delete(`${API_BASE}/courses/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setCourses(courses.filter((c) => c._id !== id));
    } catch (err) {
      alert('Failed to delete course');
    }
  };
  const handleCourseCreated = (newCourse) => {
    setCourses([...courses, newCourse]);
    setShowCourseForm(false);
  };
  const handleQuizAdded = (courseId, newQuiz) => {
    setCourses(
      courses.map((course) =>
        course._id === courseId ? { ...course, quizzes: [...course.quizzes, newQuiz] } : course
      )
    );
    setShowQuizForm(null);
  };
  return (
    <div className="container">
      <h2>Admin Dashboard</h2>
      <button onClick={() => setShowCourseForm(!showCourseForm)}>
        {showCourseForm ? 'Close Course Form' : 'Add New Course'}
      </button>
      {showCourseForm && <AddCourseForm token={token} onCourseCreated={handleCourseCreated} />}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {courses.map((course) => (
            <div className="card" key={course._id}>
              <h4>{course.title}</h4>
              <p>{course.description}</p>
              <button onClick={() => deleteCourse(course._id)}>Delete</button>
              <button style={{ marginLeft: '0.5rem' }} onClick={() => setShowQuizForm(showQuizForm === course._id ? null : course._id)}>
                {showQuizForm === course._id ? 'Close Quiz Form' : 'Add Quiz'}
              </button>
              {showQuizForm === course._id && (
                <AddQuizForm token={token} courseId={course._id} onQuizAdded={(quiz) => handleQuizAdded(course._id, quiz)} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddCourseForm({ token, onCourseCreated }) {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [videosText, setVideosText] = React.useState('');
  const [error, setError] = React.useState('');
  const submit = async (e) => {
    e.preventDefault();
    try {
      const videos = videosText
        .split('\n')
        .map((v) => v.trim())
        .filter((v) => v);
      const res = await axios.post(
        `${API_BASE}/courses`,
        { title, description, videos },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onCourseCreated(res.data);
      setTitle('');
      setDescription('');
      setVideosText('');
    } catch (err) {
      setError('Failed to create course');
    }
  };
  return (
    <div className="card" style={{ marginTop: '1rem' }}>
      <h4>Add Course</h4>
      {error && <p className="error">{error}</p>}
      <form onSubmit={submit}>
        <input type="text" placeholder="Course Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea placeholder="Course Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        <textarea placeholder="Video URLs (one per line)" value={videosText} onChange={(e) => setVideosText(e.target.value)} />
        <button type="submit">Create Course</button>
      </form>
    </div>
  );
}

function AddQuizForm({ token, courseId, onQuizAdded }) {
  const [questions, setQuestions] = React.useState([
    { question: '', options: ['', '', '', ''], correctAnswer: 0 }
  ]);
  const [error, setError] = React.useState('');
  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };
  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };
  const updateOption = (qIndex, optIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[optIndex] = value;
    setQuestions(newQuestions);
  };
  const submit = async (e) => {
    e.preventDefault();
    try {
      // Ensure all questions have text and options
      for (const q of questions) {
        if (!q.question.trim() || q.options.some((o) => !o.trim())) {
          setError('Please fill all fields');
          return;
        }
      }
      const res = await axios.post(
        `${API_BASE}/quizzes/course/${courseId}`,
        { questions },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onQuizAdded(res.data);
      // Reset form
      setQuestions([{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
    } catch (err) {
      setError('Failed to create quiz');
    }
  };
  return (
    <div className="card" style={{ marginTop: '1rem' }}>
      <h4>Add Quiz</h4>
      {error && <p className="error">{error}</p>}
      <form onSubmit={submit}>
        {questions.map((q, qIndex) => (
          <div key={qIndex} style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder={`Question ${qIndex + 1}`}
              value={q.question}
              onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
              required
            />
            {q.options.map((opt, optIndex) => (
              <input
                key={optIndex}
                type="text"
                placeholder={`Option ${optIndex + 1}`}
                value={opt}
                onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                required
              />
            ))}
            <label>
              Correct Answer Index:
              <select
                value={q.correctAnswer}
                onChange={(e) => updateQuestion(qIndex, 'correctAnswer', parseInt(e.target.value))}
              >
                {q.options.map((_, idx) => (
                  <option key={idx} value={idx}>{idx + 1}</option>
                ))}
              </select>
            </label>
          </div>
        ))}
        <button type="button" onClick={addQuestion}>Add Another Question</button>
        <button type="submit" style={{ marginLeft: '0.5rem' }}>Create Quiz</button>
      </form>
    </div>
  );
}

function App() {
  const [user, setUser] = React.useState(null);
  const [token, setToken] = React.useState(localStorage.getItem('token') || '');
  const [page, setPage] = React.useState('home');
  const [currentCourseId, setCurrentCourseId] = React.useState(null);

  // Load user from token on initial mount
  React.useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await axios.get(`${API_BASE}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
          setUser(res.data);
        } catch (err) {
          console.error('Failed to load user');
          setToken('');
          setUser(null);
          localStorage.removeItem('token');
        }
      }
    }
    loadUser();
  }, [token]);

  const handleLogin = (data) => {
    setToken(data.token);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    setPage('dashboard');
  };

  const handleRegister = (data) => {
    setToken(data.token);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    setPage('dashboard');
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    setPage('home');
  };

  const handleEnroll = async (courseId) => {
    try {
      await axios.post(`${API_BASE}/enroll/${courseId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert('Enrolled successfully');
    } catch (err) {
      alert('Enrollment failed');
    }
  };

  return (
    <>
      <Navigation user={user} setPage={setPage} handleLogout={handleLogout} />
      {page === 'home' && <HomePage setPage={setPage} />}
      {page === 'courses' && (
        <CoursesPage token={token} setPage={setPage} setCurrentCourseId={setCurrentCourseId} handleEnroll={handleEnroll} />
      )}
      {page === 'course' && currentCourseId && <CoursePage courseId={currentCourseId} token={token} />}
      {page === 'login' && <LoginPage handleLogin={handleLogin} />}
      {page === 'register' && <RegisterPage handleRegister={handleRegister} />}
      {page === 'dashboard' && user && (
        user.role === 'admin' ? <AdminDashboard token={token} /> : <Dashboard user={user} token={token} setPage={setPage} setCurrentCourseId={setCurrentCourseId} />
      )}
    </>
  );
}

// Render application
ReactDOM.render(<App />, document.getElementById('root'));