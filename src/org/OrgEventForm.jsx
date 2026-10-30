import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api.js';

const toInput = (s) => (s ? s.replace(' ', 'T').slice(0, 16) : '');

export default function OrgEventForm() {
  const { id } = useParams();          // present when editing
  const nav = useNavigate();
  const [f, setF] = useState({ title: '', description: '', location: '', start_at: '', end_at: '', capacity: '', fine_per_session: 25 });
  const [poster, setPoster] = useState(null);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  useEffect(() => {
    if (!id) return;
    api.get(`/events/${id}`).then(({ event: ev }) => {
      setCurrent(ev);
      setF({
        title: ev.title, description: ev.description || '', location: ev.location,
        start_at: toInput(ev.start_at), end_at: toInput(ev.end_at),
        capacity: ev.capacity || '', fine_per_session: ev.fine_per_session
      });
    }).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [id]);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const fd = new FormData();
    Object.entries(f).forEach(([k, v]) => fd.append(k, v));
    if (poster) fd.append('poster', poster);
    try {
      const d = await api.post(id ? `/admin/events/${id}/update` : '/admin/events', fd);
      nav('/org', { state: { msg: d.message } });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  if (loading) return <p className="muted">Loading…</p>;

  return (
    <>
      <Link to="/org" className="muted">← Back to my events</Link>
      <h1>{id ? 'Edit event' : 'New event'}</h1>
      {current?.status === 'rejected' && (
        <div className="note-box"><b>Why it was rejected</b><p>{current.review_note || 'No reason was given.'}</p></div>
      )}
      <form className="card" onSubmit={submit}>
        <label className="field-label">Title</label>
        <input value={f.title} onChange={set('title')} required />
        <label className="field-label">Description</label>
        <textarea rows="4" value={f.description} onChange={set('description')} />
        <label className="field-label">Venue</label>
        <input value={f.location} onChange={set('location')} required />
        <div className="two">
          <div><label className="field-label">Starts</label><input type="datetime-local" value={f.start_at} onChange={set('start_at')} required /></div>
          <div><label className="field-label">Ends</label><input type="datetime-local" value={f.end_at} onChange={set('end_at')} required /></div>
        </div>
        <div className="two">
          <div><label className="field-label">Capacity (empty = unlimited)</label><input type="number" min="1" value={f.capacity} onChange={set('capacity')} /></div>
          <div><label className="field-label">Fine per missed scan (₱)</label><input type="number" min="0" step="0.01" value={f.fine_per_session} onChange={set('fine_per_session')} /></div>
        </div>
        <label className="field-label">Poster {current?.poster_url && '(leave empty to keep the current one)'}</label>
        {current?.poster_url && <img className="thumb" src={current.poster_url} alt="Current poster" />}
        <input type="file" accept="image/*" onChange={(e) => setPoster(e.target.files[0] || null)} />

        {error && <p className="error">{error}</p>}
        <p className="muted">{id ? 'Saving sends the event back to the admin for approval.' : 'New events are submitted to the admin for approval.'}</p>
        <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : id ? 'Save & resubmit' : 'Submit for approval'}</button>
      </form>
    </>
  );
}