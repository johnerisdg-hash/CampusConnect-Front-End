import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { AuthLayout } from '../ui.jsx';

export default function Register() {
  const nav = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [form, setForm] = useState({ full_name: '', email: '', password: '', organization_id: '' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => { api.get('/programs').then((d) => setPrograms(d.programs)).catch(() => {}); }, []);

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/signup', form);
      nav('/login');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AuthLayout>
      <h1>Student Register</h1>
      <form onSubmit={submit}>
        <div className="auth-field">
          <label htmlFor="reg-name">Full name:</label>
          <input id="reg-name" value={form.full_name} onChange={set('full_name')} required />
        </div>
        <div className="auth-field">
          <label htmlFor="reg-email">Email:</label>
          <input id="reg-email" type="email" placeholder="name@school.edu" value={form.email} onChange={set('email')} required />
        </div>
        <div className="auth-field">
          <label htmlFor="reg-program">Course / program:</label>
          <select id="reg-program" value={form.organization_id} onChange={set('organization_id')} required>
            <option value="">Select your course or program</option>
            {programs.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <p className="muted auth-hint">You'll see your program's events, plus USG events that are open to the whole campus.</p>
        </div>
        <div className="auth-field">
          <label htmlFor="reg-password">Password (min 6 characters):</label>
          <input id="reg-password" type="password" value={form.password} onChange={set('password')} required />
        </div>
        {error && <p className="error">{error}</p>}
        <button className="btn primary block">Create account</button>
      </form>
      <p className="center">Already registered? <Link to="/login">Login</Link></p>
    </AuthLayout>
  );
}
