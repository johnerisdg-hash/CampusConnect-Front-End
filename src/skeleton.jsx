// Loading skeletons: grey placeholder shapes that copy the real layout, so the screen does not jump or look blank
// while data loads. Front-end only: nothing here talks to the server.
import { useLocation } from 'react-router-dom';
import logo from './assets/msu-logo.png';

const Sk = ({ w, h = 14, r, className = '', style }) => (
  <span className={`sk ${className}`} style={{ width: w, height: h, borderRadius: r, ...style }} aria-hidden="true" />
);
const Lines = ({ widths }) => widths.map((w, i) => <Sk key={i} w={w} h={13} className="sk-line" />);
const Busy = ({ children, className = '' }) => (
  <div className={className} role="status" aria-busy="true" aria-live="polite">
    <span className="sr-only">Loading…</span>
    {children}
  </div>
);
const Title = ({ w = 220 }) => <div className="sk-title-wrap"><Sk w={w} h={34} r={10} /></div>;

/* ---------- page-body skeletons (shown inside the real header) ---------- */

export function SkCards({ count = 6, feed = false, section = 'admin-upcoming' }) {
  return (
    <Busy className={`${section} sk-page`}>
      <Title w={feed ? 280 : 160} />
      {feed && <Sk w={140} h={12} className="sk-grouplabel" />}
      <div className="admin-card-grid">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="admin-upcoming-card sk-card">
            <Sk className="sk-block" h={feed ? 300 : 230} r={0} />
            <div className="admin-card-body">
              <Sk w="68%" h={20} r={8} />
              <Sk w="52%" h={13} className="sk-line" />
              <Sk w="44%" h={13} className="sk-line" />
              <Sk w="30%" h={13} className="sk-line" />
              <div className="sk-row"><Sk w={96} h={36} r={8} /><Sk w={64} h={36} r={8} /></div>
            </div>
          </div>
        ))}
      </div>
    </Busy>
  );
}

export function SkTable({ rows = 6, cols = 6, summary = false, section = 'admin-dashboard' }) {
  return (
    <Busy className={`${section} sk-page`}>
      <Title w={summary ? 300 : 190} />
      {summary && (
        <div className="card sk-summary">
          <Sk w={160} h={14} /><Sk w={120} h={14} /><Sk w={100} h={14} />
        </div>
      )}
      <div className="admin-table-wrap">
        <table className="admin-table sk-table">
          <thead><tr>{Array.from({ length: cols }, (_, i) => <th key={i}><Sk w={i === 0 ? 70 : 54} h={11} /></th>)}</tr></thead>
          <tbody>
            {Array.from({ length: rows }, (_, r) => (
              <tr key={r}>
                {Array.from({ length: cols }, (_, c) => (
                  <td key={c}>
                    {c === 0 ? <><Sk w="78%" h={13} /><Sk w="48%" h={11} className="sk-line" /></> : c === cols - 1 ? <Sk w={90} h={32} r={8} /> : <Sk w={c === 2 ? 70 : 54} h={13} r={c === 2 ? 999 : undefined} />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Busy>
  );
}

export function SkForm({ fields = 6, section = 'admin-create-event', title = true }) {
  return (
    <Busy className={`${section} sk-page`}>
      {title && <Title w={210} />}
      <div className="admin-create-form sk-form">
        {Array.from({ length: fields }, (_, i) => (
          <div key={i} className="sk-field">
            <Sk w={110 + (i % 3) * 30} h={12} />
            <Sk className="sk-input" h={i === 1 ? 96 : 40} r={8} />
          </div>
        ))}
        <Sk w={150} h={42} r={8} />
      </div>
    </Busy>
  );
}

export function SkDetail() {
  return (
    <Busy className="sk-page">
      <Sk w={130} h={14} className="sk-back" />
      <div className="card detail sk-detail">
        <Sk className="sk-block" h={220} r={10} />
        <Sk w="55%" h={28} r={8} />
        <Sk w="30%" h={14} className="sk-line" />
        <Lines widths={['92%', '86%', '60%']} />
        <Sk w="46%" h={14} className="sk-line" />
        <Sk w="34%" h={14} className="sk-line" />
        <div className="sk-row"><Sk w={110} h={40} r={8} /><Sk w={190} h={40} r={8} /></div>
      </div>
    </Busy>
  );
}

export function SkPass({ count = 2 }) {
  return (
    <Busy className="sk-page">
      <Sk w={200} h={30} r={8} className="sk-h1" />
      <div className="card sk-summary"><Sk w={220} h={14} /></div>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card pass sk-pass">
          <Sk w={198} h={198} r={12} />
          <div className="sk-pass-body">
            <Sk w="60%" h={20} r={8} />
            <Sk w="75%" h={13} className="sk-line" />
            <Sk w={90} h={22} r={999} className="sk-line" />
            {[0, 1, 2, 3].map((r) => <div key={r} className="sk-row sk-between"><Sk w={90} h={13} /><Sk w={120} h={13} /></div>)}
          </div>
        </div>
      ))}
    </Busy>
  );
}

// Simple stacked-card page (approvals, account lists, review screens)
export function SkList({ rows = 4 }) {
  return (
    <Busy className="sk-page">
      <Sk w={220} h={30} r={8} className="sk-h1" />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="card sk-listcard">
          <Sk w="40%" h={18} r={8} />
          <Sk w="62%" h={13} className="sk-line" />
          <Sk w="28%" h={13} className="sk-line" />
        </div>
      ))}
    </Busy>
  );
}

/* ---------- whole-screen skeleton (shown while the app checks who is signed in) ---------- */

const p = (re, path) => re.test(path);

function pageFor(path, role) {
  if (role === 'admin' || role === 'org') {
    const base = `/${role}`;
    const rest = path.slice(base.length) || '/';
    if (rest.startsWith('/dashboard')) return <SkTable />;
    if (p(/^\/events\/[^/]+\/attendance/, rest)) return <SkTable summary section="admin-attendance" />;
    if (p(/^\/events\/[^/]+\/scan/, rest)) return <SkForm fields={3} section="admin-scan-page" />;
    if (p(/^\/(create-event|events\/new|events\/[^/]+\/edit)/, rest)) return <SkForm fields={7} />;
    if (p(/^\/(accounts|review)/, rest)) return <SkList />;
    return <SkCards />;
  }
  if (p(/^\/my-events/, path)) return <SkPass />;
  if (p(/^\/events\//, path)) return <SkDetail />;
  return <SkCards feed count={3} section="admin-upcoming student-upcoming" />;
}

function AuthSkeleton() {
  return (
    <div className="auth sk-auth">
      <aside className="auth-hero">
        <div className="hero-brand">
          <img alt="Mindoro State University logo" src={logo} />
          <div>
            <strong>CampusConnect</strong>
            <span>Mindoro State University · Calapan Campus</span>
          </div>
        </div>
        <div className="hero-copy">
          <h1>Every school event,<br />one simple place.</h1>
          <ul>
            <li>Discover events happening on campus</li>
            <li>Register and keep track of your attendance</li>
            <li>Stay connected with your campus community</li>
          </ul>
        </div>
      </aside>
      <main className="auth-main">
        <div className="auth-content">
          <Busy>
            <Sk w={230} h={32} r={8} className="sk-h1" />
            <div className="sk-row"><Sk w={90} h={36} r={999} /><Sk w={70} h={36} r={999} /><Sk w={170} h={36} r={999} /></div>
            {[0, 1].map((i) => <div key={i} className="sk-field"><Sk w={70} h={12} /><Sk className="sk-input" h={44} r={10} /></div>)}
            <Sk className="sk-input" h={46} r={10} />
          </Busy>
        </div>
      </main>
    </div>
  );
}

export function AppSkeleton() {
  const { pathname } = useLocation();
  if (/^(\/admin|\/org)?\/login\/?$|^\/register\/?$/.test(pathname)) return <AuthSkeleton />;
  const role = pathname.startsWith('/admin') ? 'admin' : pathname.startsWith('/org') ? 'org' : 'student';
  const links = role === 'admin' ? 4 : role === 'org' ? 3 : 2;
  return (
    <>
      <header className={`admin-topbar${role === 'student' ? ' student-topbar' : ''}`} aria-hidden="true">
        <div className="admin-brand"><img className="brand-logo" alt="Mindoro State University logo" src={logo} />CampusConnect</div>
        <nav className="admin-nav">
          {Array.from({ length: links }, (_, i) => <Sk key={i} w={i === 0 ? 62 : 78} h={30} r={8} />)}
        </nav>
        <div className="admin-header-actions"><Sk w={110} h={14} /><Sk w={78} h={36} r={8} /></div>
      </header>
      <main className={`admin-page${role === 'student' ? ' student-page' : ''}`}>{pageFor(pathname, role)}</main>
    </>
  );
}
