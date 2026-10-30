import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../../api.js';
import { fmt } from '../../ui.jsx';

export default function Approvals() {
  const { state } = useLocation();
  const [tab, setTab] = useState('events');
  const [events, setEvents] = useState(null);
  const [requests, setRequests] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/events').then((d) => setEvents(d.events.filter((e) => e.status === 'pending'))).catch((e) => setError(e.message));
    api.get('/admin/change-requests?status=pending').then((d) => setRequests(d.requests)).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!events || !requests) return <p className="muted">Loading…</p>;

  return (
    <>
      <h1>Approvals</h1>
      {state?.msg && <p className="success">{state.msg}</p>}

      <div className="tabs">
        <button className={tab === 'events' ? 'active' : ''} onClick={() => setTab('events')}>New events ({events.length})</button>
        <button className={tab === 'changes' ? 'active' : ''} onClick={() => setTab('changes')}>Change requests ({requests.length})</button>
      </div>

      {tab === 'events' && (events.length === 0
        ? <p className="muted">No events are waiting for review.</p>
        : events.map((e) => (
          <div key={e.id} className="card row spread">
            <div>
              <h3>{e.title}</h3>
              <p className="muted">{e.organization_name} · {fmt(e.start_at)} · {e.location}</p>
            </div>
            <Link className="btn primary" to={`/admin/review/${e.id}`}>Review</Link>
          </div>
        )))}

      {tab === 'changes' && (requests.length === 0
        ? <p className="muted">No change requests are waiting.</p>
        : requests.map((r) => (
          <div key={r.id} className="card row spread">
            <div>
              <h3>{r.title}</h3>
              <p className="muted">Requested by {r.requested_by_name} · {fmt(r.created_at)}</p>
              {r.reason && <p>Reason: {r.reason}</p>}
            </div>
            <Link className="btn primary" to={`/admin/changes/${r.id}`}>Review</Link>
          </div>
        )))}
    </>
  );
}