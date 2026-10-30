import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api.js';
import { Badge, fmt, peso } from '../../ui.jsx';

export default function ReviewEvent() {
  const { id } = useParams();
  const { state } = useLocation();
  const nav = useNavigate();
  const returnTo = state?.returnTo || '/admin';
  const [ev, setEv] = useState(null);
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { api.get(`/events/${id}`).then((d) => setEv(d.event)).catch((e) => setError(e.message)); }, [id]);

  async function decide(status) {
    setError('');
    if (status === 'rejected' && note.trim().length < 5) {
      setError('Write a reason (at least 5 characters) so the organization knows what to fix.');
      return;
    }
    if (status === 'approved' && !window.confirm(`Approve "${ev.title}"? Students will be able to see it and register.`)) return;
    setBusy(true);
    try {
      const d = await api.post(`/admin/events/${id}/status`, { status, note: note.trim() });
      nav(returnTo, { state: { msg: `${ev.title}: ${d.message}` } });
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  if (!ev) return error ? <p className="error">{error}</p> : <p className="muted">Loading…</p>;
  const waiting = ev.status === 'pending';

  return (
    <>
      <Link to={returnTo} className="muted">← Back to approvals</Link>
      <h1>Review event</h1>

      <div className="card detail">
        {ev.poster_url
          ? <img className="poster big" src={ev.poster_url} alt="Event poster" />
          : <div className="poster big empty">No poster uploaded</div>}
        <h2>{ev.title}</h2>
        <table className="kv">
          <tbody>
            <tr><th>Organization</th><td>{ev.organization_name}</td></tr>
            <tr><th>Audience</th><td>{ev.scope === 'school' ? 'School-wide' : 'Program only'}</td></tr>
            <tr><th>Starts</th><td>{fmt(ev.start_at)}</td></tr>
            <tr><th>Ends</th><td>{fmt(ev.end_at)}</td></tr>
            <tr><th>Venue</th><td>{ev.location}</td></tr>
            <tr><th>Capacity</th><td>{ev.capacity || 'Unlimited'}</td></tr>
            <tr><th>Fine per missed scan</th><td>{peso(ev.fine_per_session)}</td></tr>
            <tr><th>Description</th><td>{ev.description || <span className="muted">No description</span>}</td></tr>
          </tbody>
        </table>
      </div>

      {!waiting ? (
        <div className="card">This event was already reviewed: <Badge tone={ev.status === 'approved' ? 'green' : 'red'}>{ev.status}</Badge>
          {ev.review_note && <p>Reason given: {ev.review_note}</p>}
        </div>
      ) : (
        <div className="card">
          <h3>Your decision</h3>
          <p className="muted">Check the poster, schedule, venue and description above first.</p>

          {rejecting && (
            <>
              <label className="field-label">Why is it rejected? The organization will see this note.</label>
              <textarea rows="4" maxLength="255" value={note} onChange={(e) => setNote(e.target.value)}
                placeholder="Example: The venue is already booked on that date. Please choose another date or place." />
              <p className="muted counter">{note.length}/255</p>
            </>
          )}
          {error && <p className="error">{error}</p>}

          <div className="row">
            {!rejecting ? (
              <>
                <button className="btn primary" onClick={() => decide('approved')} disabled={busy}>Approve event</button>
                <button className="btn danger" onClick={() => setRejecting(true)} disabled={busy}>Reject…</button>
              </>
            ) : (
              <>
                <button className="btn danger" onClick={() => decide('rejected')} disabled={busy}>Send rejection</button>
                <button className="btn ghost" onClick={() => { setRejecting(false); setError(''); }} disabled={busy}>Back</button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}