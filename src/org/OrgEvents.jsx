import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../../api.js';
import { Badge, fmt } from '../../ui.jsx';

const TONE  = { approved: 'green', pending: 'amber', rejected: 'red', cancelled: 'gray' };
const LABEL = { approved: 'Approved', pending: 'Waiting for approval', rejected: 'Rejected', cancelled: 'Cancelled' };

export default function OrgEvents() {
  const { state } = useLocation();
  const [events, setEvents] = useState(null);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/admin/events'), api.get('/admin/change-requests')])
      .then(([a, b]) => { setEvents(a.events); setRequests(b.requests); })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!events) return <p className="muted">Loading…</p>;

  const latest = {};   // newest change request per event (the list is newest first)
  requests.forEach((r) => { if (!latest[r.event_id]) latest[r.event_id] = r; });

  return (
    <>
      <h1>My Events</h1>
      {state?.msg && <p className="success">{state.msg}</p>}
      {events.length === 0 && <p className="muted">You haven't created any events yet. <Link to="/org/events/new">Create one</Link></p>}

      {events.map((ev) => {
        const cr = latest[ev.id];
        return (
          <div key={ev.id} className="card">
            <div className="row spread">
              <h3>{ev.title}</h3>
              <Badge tone={TONE[ev.status]}>{LABEL[ev.status]}</Badge>
            </div>
            <p className="muted">{fmt(ev.start_at)} · {ev.location} · Registered: {ev.registered_count}</p>

            {ev.status === 'pending' && <p className="muted">The admin is reviewing this event.</p>}

            {ev.status === 'rejected' && (
              <div className="note-box">
                <b>Rejected by the admin</b>
                <p>Reason: {ev.review_note || 'No reason was given.'}</p>
                <p className="muted">Fix the problem, then resubmit it for approval.</p>
              </div>
            )}

            {cr?.status === 'pending' && <p className="muted">Your change request is waiting for the admin.</p>}
            {cr?.status === 'rejected' && (
              <div className="note-box">
                <b>Change request rejected</b>
                <p>Reason: {cr.review_note || 'No reason was given.'}</p>
              </div>
            )}

            {['pending', 'rejected'].includes(ev.status) && (
              <div className="row">
                <Link className="btn primary" to={`/org/events/${ev.id}/edit`}>
                  {ev.status === 'rejected' ? 'Edit & resubmit' : 'Edit'}
                </Link>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}