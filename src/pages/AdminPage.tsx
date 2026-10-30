import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { PageShell } from '../components/PageShell';
import { siteConfig } from '../config';

interface BetaRequest {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  institution: string;
  role: string;
  use_case: string;
  platform?: string;
  research?: string;
  status?: string;
  submitted_at: string;
}

const statuses = ['pending', 'approved', 'rejected'] as const;
type Status = typeof statuses[number];
const safeStatus = (value?: string): Status => statuses.includes(value as Status) ? value as Status : 'pending';

export function AdminPage() {
  const [key, setKey] = useState('');
  const [requests, setRequests] = useState<BetaRequest[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | Status>('all');
  const [selected, setSelected] = useState<BetaRequest | null>(null);
  const [note, setNote] = useState('');
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { setKey(sessionStorage.getItem('admin_key') ?? ''); }, []);
  useEffect(() => { if (selected) closeRef.current?.focus(); }, [selected]);

  async function load(adminKey = key) {
    if (!adminKey) return;
    setLoading(true); setError('');
    try {
      const response = await fetch(`${siteConfig.workerUrl}/admin/requests`, { headers: { 'X-Admin-Key': adminKey } });
      const data = await response.json().catch(() => ({})) as { requests?: BetaRequest[]; error?: string } | BetaRequest[];
      if (!response.ok) throw new Error(!Array.isArray(data) && data.error ? data.error : 'Unable to load requests.');
      setRequests(Array.isArray(data) ? data : data.requests ?? []);
      sessionStorage.setItem('admin_key', adminKey);
      setKey(adminKey);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to load requests.'); }
    finally { setLoading(false); }
  }

  function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    void load(String(formData.get('password') ?? '').trim());
  }

  async function update(request: BetaRequest, nextStatus: Exclude<Status, 'pending'>) {
    setLoading(true); setError('');
    try {
      const response = await fetch(`${siteConfig.workerUrl}/admin/requests/${encodeURIComponent(request.id)}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', 'X-Admin-Key': key },
        body: JSON.stringify({ status: nextStatus, note }),
      });
      const data = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(data.error || `Unable to mark request ${nextStatus}.`);
      setRequests((current) => current.map((item) => item.id === request.id ? { ...item, status: nextStatus } : item));
      setSelected(null); setNote('');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to update request.'); }
    finally { setLoading(false); }
  }

  const filtered = useMemo(() => requests.filter((request) => {
    const haystack = `${request.first_name} ${request.last_name} ${request.email} ${request.institution}`.toLowerCase();
    return (status === 'all' || safeStatus(request.status) === status) && haystack.includes(search.toLowerCase());
  }), [requests, search, status]);

  function exportCsv() {
    const fields: Array<keyof BetaRequest> = ['first_name', 'last_name', 'email', 'institution', 'role', 'use_case', 'status', 'submitted_at'];
    const csv = [fields.join(','), ...filtered.map((request) => fields.map((field) => `"${String(request[field] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const anchor = document.createElement('a'); anchor.href = href; anchor.download = 'omnibioai-beta-requests.csv'; anchor.click(); URL.revokeObjectURL(href);
  }

  function logout() { sessionStorage.removeItem('admin_key'); setKey(''); setRequests([]); setError(''); }

  return <PageShell compact><main className="admin-main shell" id="main-content"><p className="eyebrow">Restricted operations</p><h1>Beta requests</h1>
    {!key || requests.length === 0 && error ? <form className="form-card admin-login" onSubmit={login}><div className="field"><label htmlFor="admin-password">Admin password</label><input className="admin-input" id="admin-password" name="password" type="password" autoComplete="current-password" required /></div><p className="form-status" role="alert">{error}</p><button className="button" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button></form> : <>
      <div className="admin-toolbar"><div className="field"><label htmlFor="admin-search">Search requests</label><input className="admin-input" id="admin-search" value={search} onChange={(event) => setSearch(event.target.value)} /></div><div className="field"><label htmlFor="admin-status">Status</label><select className="admin-input" id="admin-status" value={status} onChange={(event) => setStatus(event.target.value as 'all' | Status)}><option value="all">All</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select></div><button className="button button-secondary" type="button" onClick={() => void load()} disabled={loading}>Refresh</button><button className="button button-secondary" type="button" onClick={exportCsv}>Export CSV</button><button className="button button-secondary" type="button" onClick={logout}>Sign out</button></div>
      <p role="status" className={error ? 'form-status' : 'muted'}>{error || `${filtered.length} of ${requests.length} requests`}</p>
      <div className="table-wrap"><table className="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Institution</th><th>Role</th><th>Status</th><th>Submitted</th><th>Action</th></tr></thead><tbody>{filtered.map((request) => <tr key={request.id}><td>{request.first_name} {request.last_name}</td><td>{request.email}</td><td>{request.institution}</td><td>{request.role}</td><td><span className={`badge badge-${safeStatus(request.status)}`}>{safeStatus(request.status)}</span></td><td>{new Date(request.submitted_at).toLocaleDateString('en-US')}</td><td><button className="button button-secondary button-small" type="button" onClick={() => setSelected(request)}>View</button></td></tr>)}</tbody></table></div>
    </>}
    {selected && <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><div className="dialog" role="dialog" aria-modal="true" aria-labelledby="request-dialog-title"><div className="dialog-head"><div><p className="eyebrow">Request details</p><h2 id="request-dialog-title">{selected.first_name} {selected.last_name}</h2></div><button ref={closeRef} className="dialog-close" aria-label="Close request details" onClick={() => setSelected(null)}>×</button></div><dl><dt>Email</dt><dd>{selected.email}</dd><dt>Institution</dt><dd>{selected.institution}</dd><dt>Role</dt><dd>{selected.role}</dd><dt>Use case</dt><dd>{selected.use_case}</dd><dt>Platform</dt><dd>{selected.platform || '—'}</dd><dt>Research</dt><dd>{selected.research || '—'}</dd></dl><div className="field"><label htmlFor="decision-note">Optional note</label><textarea id="decision-note" value={note} onChange={(event) => setNote(event.target.value)} /></div><div className="hero-actions"><button className="button" disabled={loading} onClick={() => void update(selected, 'approved')}>Approve and send email</button><button className="button button-secondary" disabled={loading} onClick={() => void update(selected, 'rejected')}>Reject</button></div></div></div>}
  </main></PageShell>;
}
