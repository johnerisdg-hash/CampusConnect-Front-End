import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api.js';
import { fmt, peso } from '../../ui.jsx';

const FIELDS = [
  ['title', 'Title'], ['description', 'Description'], ['location', 'Venue'],
  ['start_at', 'Starts'], ['end_at', 'Ends'], ['capacity', 'Capacity'], ['fine_per_session', 'Fine per missed scan']
];
const show = (k, v) => {
  if (v === null || v === undefined || v === '') return k === 'capacity' ? 'Unlimited' : '—';
  if (k === 'start_at' || k === 'end_at') return fmt(v);
  if (k === 'fine_per_session') return peso(v);
  return String(v);
};
const same = (k, a, b) =>
  k === 'capacity' || k === 'fine_per_session' ? Number(a || 0) === Number(b || 0) : String(a ?? '') === String(b ?? '');

export default function ReviewChange() {
  const { id } = useParams();
  const nav = useNavigate();
  const [req, setReq] = useState(null);
  const [ev, setEv] = useState(null);
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/change-requests').then(async (d) => {
      const r = d.requests.find((x) => String(x.id) === id);
      if (!r) return setError('Change request not found.');
      setReq(r);
      setEv((await api.get(`/events/${r.event_id}`)).event);
    }).catch((e) => setError(e.message));
  }, [id]);

  async function decide(approve) {
    setError('');
    if (!approve && note.trim().length < 5) { setError('Write a reason (at least 5 characters) so the organization knows what to fix.'); return; }
    setBusy(true);
    try {
      const d = approve
        ? await api.post(`/admin/change-requests/${id}/approve`)
        : await api.post(`/admin/change-requests/${id}/reject`, { note: note.trim() });
      nav('/admin', { state: { msg: `${ev.title}: ${d.message}` } });
    } catch (e) { setError(e.message); setBusy(false); }
  }

  if (!req || !ev) return error ? <p className="error">{error}</p> : <p className="muted">Loading…</p>;
  const changes = req.changes || {};

  return (
    <>
      <Link to="/admin" className="muted">← Back to approvals</Link>
      <h1>Review change request</h1>
      <div className="card">
        <h3>{ev.title}</h3>
        <p className="muted">Requested by {req.requested_by_name} · {fmt(req.created_at)}</p>
        {req.reason && <p>Reason: {req.reason}</p>}
        <table className="diff">
          <thead><tr><th></th><th>Current</th><th>Requested</th></tr></thead>
          <tbody>
            {FIELDS.filter(([k]) => k in changes).map(([k, label]) => {
              const changed = !same(k, ev[k], changes[k]);
              return (
                <tr key={k} className={changed ? 'changed' : ''}>
                  <th>{label}</th><td>{show(k, ev[k])}</td><td>{show(k, changes[k])}</td>
                </tr>
              );
            })}
            {changes.poster_url && (
              <tr className="changed"><th>Poster</th>
                <td>{ev.poster_url ? <img className="thumb" src={ev.poster_url} alt="" /> : '—'}</td>
                <td><img className="thumb" src={changes.poster_url} alt="" /></td></tr>
            )}
          </tbody>
        </table>
        <p className="muted">Highlighted rows are the ones that change.</p>
      </div>

      {req.status !== 'pending' ? (
        <div className="card">Already reviewed: <b>{req.status}</b>{req.review_note && <p>Reason given: {req.review_note}</p>}</div>
      ) : (
        <div className="card">
          {rejecting && (
            <>
              <label className="field-label">Why is it rejected? The organization will see this note.</label>
              <textarea rows="4" maxLength="255" value={note} onChange={(e) => setNote(e.target.value)} />
              <p className="muted counter">{note.length}/255</p>
            </>
          )}
          {error && <p className="error">{error}</p>}
          <div className="row">
            {!rejecting ? (
              <>
                <button className="btn primary" onClick={() => decide(true)} disabled={busy}>Approve change</button>
                <button className="btn danger" onClick={() => setRejecting(true)} disabled={busy}>Reject…</button>
              </>
            ) : (
              <>
                <button className="btn danger" onClick={() => decide(false)} disabled={busy}>Send rejection</button>
                <button className="btn ghost" onClick={() => { setRejecting(false); setError(''); }} disabled={busy}>Back</button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}