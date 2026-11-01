import { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { Badge } from '../../ui.jsx';

const EMPTY = { full_name: '', email: '', password: '', organization_id: '', new_organization: '' };

function OrgSelect({ orgs, value, onChange }) {
  return (
    <select value={value} onChange={onChange}>
      <option value="">Select an organization</option>
      {orgs.map((o) => (
        <option key={o.id} value={o.id}>
          {o.organization_name}{o.manager_count > 0 ? ' (has a manager)' : ''}
        </option>
      ))}
    </select>
  );
}

// Inline editor shown under a row
function EditRow({ m, orgs, onSaved, onCancel }) {
  const [f, setF] = useState({ full_name: m.full_name, email: m.email, organization_id: m.organization_id || '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function save(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const body = { full_name: f.full_name, email: f.email, organization_id: f.organization_id };
      if (f.password) body.password = f.password;          // leave empty to keep the current password
      const d = await api.post(`/admin/managers/${m.id}/update`, body);
      onSaved(d.message);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <tr>
      <td colSpan="5">
        <form className="card" onSubmit={save}>
          <h3>Edit {m.full_name}</h3>
          <div className="two">
            <div><label className="field-label">Full name</label><input value={f.full_name} onChange={set('full_name')} required /></div>
            <div><label className="field-label">Email</label><input type="email" value={f.email} onChange={set('email')} required /></div>
          </div>
          <div className="two">
            <div><label className="field-label">Organization</label><OrgSelect orgs={orgs} value={f.organization_id} onChange={set('organization_id')} /></div>
            <div><label className="field-label">New password (leave empty to keep it)</label><input type="text" autoComplete="off" value={f.password} onChange={set('password')} /></div>
          </div>
          {error && <p className="error">{error}</p>}
          <div className="row">
            <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
            <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </td>
    </tr>
  );
}

export default function Accounts() {
  const [managers, setManagers] = useState(null);
  const [orgs, setOrgs] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const load = () =>
    Promise.all([api.get('/admin/managers'), api.get('/admin/organizations')])
      .then(([m, o]) => { setManagers(m.managers); setOrgs(o.organizations); })
      .catch((e) => setError(e.message));

  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    setError('');
    setMsg('');

    const email = form.email.trim();
    const newName = form.new_organization.trim();
    if (!form.full_name.trim() || !/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a name and a valid email.');
    if (form.password.length < 6) return setError('The password must be at least 6 characters.');
    if (!newName && !form.organization_id) return setError('Choose an organization, or type the name of a new one.');

    setBusy(true);
    try {
      let orgId = form.organization_id;
      if (newName) {
        const existing = orgs.find((o) => o.organization_name.toLowerCase() === newName.toLowerCase());
        if (existing) {
          orgId = existing.id;
        } else {
          await api.post('/admin/organizations', { organization_name: newName });
          const list = (await api.get('/admin/organizations')).organizations;
          orgId = list.find((o) => o.organization_name === newName)?.id;
        }
      }
      const d = await api.post('/admin/managers', {
        full_name: form.full_name.trim(), email, password: form.password, organization_id: orgId
      });
      setMsg(`${d.message} They can sign in at /org/login with ${email}.`);
      setForm(EMPTY);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function toggle(m) {
    setError(''); setMsg('');
    try {
      await api.post(`/admin/managers/${m.id}/update`, { status: m.status === 'active' ? 'inactive' : 'active' });
      await load();
    } catch (err) { setError(err.message); }
  }

  async function remove(m) {
    if (!window.confirm(`Delete the account of ${m.full_name}?`)) return;
    setError(''); setMsg('');
    try {
      const d = await api.post(`/admin/managers/${m.id}/delete`);
      setMsg(d.message);
      await load();
    } catch (err) { setError(err.message); }
  }

  if (!managers) return error ? <p className="error">{error}</p> : <p className="muted">Loading…</p>;

  return (
    <>
      <h1>Organization accounts</h1>
      {msg && <p className="success">{msg}</p>}
      {error && <p className="error">{error}</p>}

      <form className="card" onSubmit={create}>
        <h3>Add an organization account</h3>
        <p className="muted">One manager account per organization or department.</p>
        <div className="two">
          <div><label className="field-label">Manager's full name</label><input value={form.full_name} onChange={set('full_name')} required /></div>
          <div><label className="field-label">Email (used to log in)</label><input type="email" value={form.email} onChange={set('email')} required /></div>
        </div>
        <label className="field-label">Password (at least 6 characters)</label>
        <input type="text" autoComplete="off" value={form.password} onChange={set('password')} required />
        <div className="two">
          <div><label className="field-label">Organization</label><OrgSelect orgs={orgs} value={form.organization_id} onChange={set('organization_id')} /></div>
          <div>
            <label className="field-label">Or create a new organization</label>
            <input value={form.new_organization} onChange={set('new_organization')} placeholder="Only if it is not in the list" />
          </div>
        </div>
        <button className="btn primary" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
      </form>

      <h2>Existing accounts</h2>
      {managers.length === 0 ? <p className="muted">No organization accounts yet.</p> : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Organization</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {managers.map((m) => (
                <FragmentRow key={m.id}>
                  <tr>
                    <td>{m.full_name}</td>
                    <td>{m.email}</td>
                    <td>{m.organization_name || '—'}</td>
                    <td><Badge tone={m.status === 'active' ? 'green' : 'gray'}>{m.status}</Badge></td>
                    <td>
                      <div className="actions">
                        <button className="btn small" onClick={() => setEditId(editId === m.id ? null : m.id)}>Edit</button>
                        <button className="btn small ghost" onClick={() => toggle(m)}>{m.status === 'active' ? 'Deactivate' : 'Activate'}</button>
                        <button className="btn small danger" onClick={() => remove(m)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                  {editId === m.id && (
                    <EditRow m={m} orgs={orgs}
                      onSaved={(text) => { setEditId(null); setMsg(text); load(); }}
                      onCancel={() => setEditId(null)} />
                  )}
                </FragmentRow>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// A keyed fragment so each account can render a row plus its editor row
import { Fragment } from 'react';
const FragmentRow = Fragment;