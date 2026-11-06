import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api.js';
import { useAuth } from '../../AuthContext.jsx';
import { fmt } from '../../ui.jsx';

function displayStatus(event, now) {
  const start = new Date(String(event.start_at || '').replace(' ', 'T')).getTime();
  const end = new Date(String(event.end_at || '').replace(' ', 'T')).getTime();
  const status = String(event.status || '').toLowerCase();

  if (status === 'pending' || status === 'rejected' || status === 'cancelled') return status;
  if (Number.isFinite(end) && end < now) return 'done';
  if (Number.isFinite(start) && start <= now && Number.isFinite(end) && end >= now) return 'ongoing';
  return 'upcoming';
}

function EventCard({ event }) {
  return (
    <article className="admin-upcoming-card">
      <div className="admin-card-image-wrap">
        {event.poster_url
          ? <img src={event.poster_url} alt={event.title || 'Event poster'} className="admin-card-image" />
          : <div className="admin-card-image placeholder" aria-label="No event poster" />}
        <span className={`admin-event-status ${event.display_status}`}>{event.display_status}</span>
      </div>
      <div className="admin-card-body">
        <h2>{event.title || 'Untitled event'}</h2>
        <p className="admin-meta-line">{event.organization_name || 'General'} · {event.location || 'TBD'}</p>
        <p className="admin-meta-line">{fmt(event.start_at)}</p>
        <p className="admin-meta-line">Registered: {event.registered_count || 0}</p>
        <div className="admin-card-actions">
          <Link to={`/events/${event.id}`} className="admin-button green small">View</Link>
        </div>
      </div>
    </article>
  );
}

function Group({ title, items }) {
  if (items.length === 0) return null;
  return (
    <>
      <h2 style={{ margin: '24px 0 12px' }}>{title}</h2>
      <div className="admin-card-grid">{items.map((e) => <EventCard key={e.id} event={e} />)}</div>
    </>
  );
}

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/events')
      .then((data) => {
        if (!Array.isArray(data?.events)) throw new Error('Unable to load events: invalid response.');
        const now = Date.now();
        if (active) setEvents(data.events.map((e) => ({ ...e, display_status: displayStatus(e, now) })));
      })
      .catch((e) => { if (active) setError(e.message); });
    return () => { active = false; };
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!events) return <p className="muted">Loading…</p>;

  return (
    <section className="admin-upcoming student-upcoming">
      <h1 className="admin-page-title">Upcoming Events</h1>

      {events.length === 0 && (
        <div className="admin-state">
          No events to show yet.
          {!user.organization_id && ' Your account is not linked to a program, so only school-wide events can appear.'}
        </div>
      )}

      <Group title="School-wide events" items={events.filter((e) => e.scope === 'school')} />
      <Group title={`Events for ${user.organization_name || 'your program'}`} items={events.filter((e) => e.scope === 'program')} />
    </section>
  );
}