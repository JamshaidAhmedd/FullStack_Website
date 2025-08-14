import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setMessage(data.message || 'Logged in');
  }

  return (
    <main>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input type='email' value={email} onChange={e => setEmail(e.target.value)} placeholder='Email' />
        <input type='password' value={password} onChange={e => setPassword(e.target.value)} placeholder='Password' />
        <button type='submit'>Login</button>
      </form>
      {message && <p>{message}</p>}
    </main>
  );
}
