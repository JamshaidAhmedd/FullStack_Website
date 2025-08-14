import { useState } from 'react';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', tos: false });
  const [message, setMessage] = useState('');

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setMessage(data.message);
  }

  return (
    <main className="centered">
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" />
        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" />
        <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" />
        <label className="terms">
          <input name="tos" type="checkbox" checked={form.tos} onChange={handleChange} /> I agree to the terms
        </label>
        <button type="submit">Create Account</button>
      </form>
      {message && <p>{message}</p>}
    </main>
  );
}
