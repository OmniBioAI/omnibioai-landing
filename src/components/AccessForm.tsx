import { FormEvent, useRef, useState } from 'react';
import { siteConfig } from '../config';

type State = { kind: 'idle' | 'submitting' | 'success' | 'error'; message: string };

export function AccessForm() {
  const [state, setState] = useState<State>({ kind: 'idle', message: '' });
  const formRef = useRef<HTMLFormElement>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());
    setState({ kind: 'submitting', message: 'Submitting your request…' });
    try {
      const response = await fetch(`${siteConfig.workerUrl}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({})) as { error?: string; message?: string };
      if (!response.ok) throw new Error(result.error || result.message || 'The request could not be submitted.');
      form.reset();
      setState({ kind: 'success', message: 'Request submitted. We will review it and follow up by email.' });
    } catch (error) {
      setState({ kind: 'error', message: error instanceof Error ? error.message : 'The request could not be submitted. Please try again.' });
    }
  }

  return <form ref={formRef} className="form-card" onSubmit={submit} noValidate={false}>
    <div className="form-grid">
      <div className="field"><label htmlFor="first-name">First name</label><input id="first-name" name="first_name" autoComplete="given-name" required /></div>
      <div className="field"><label htmlFor="last-name">Last name</label><input id="last-name" name="last_name" autoComplete="family-name" required /></div>
      <div className="field field-full"><label htmlFor="email">Work or institutional email</label><input id="email" name="email" type="email" autoComplete="email" required /></div>
      <div className="field"><label htmlFor="institution">Institution</label><input id="institution" name="institution" autoComplete="organization" required /></div>
      <div className="field"><label htmlFor="role">Role</label><select id="role" name="role" required defaultValue=""><option value="" disabled>Select a role</option><option>Research scientist</option><option>Bioinformatician</option><option>Data scientist</option><option>Principal investigator</option><option>Clinician</option><option>Student</option><option>Engineering / IT</option><option>Other</option></select></div>
      <div className="field field-full"><label htmlFor="use-case">Primary use case</label><select id="use-case" name="use_case" required defaultValue=""><option value="" disabled>Select a use case</option><option>Multi-omics analysis</option><option>Single-cell analysis</option><option>Genomics and variant analysis</option><option>Proteomics</option><option>Workflow orchestration</option><option>Biomedical literature intelligence</option><option>Drug discovery</option><option>Platform evaluation</option><option>Other</option></select></div>
      <fieldset className="field field-full"><legend className="legend">Preferred platform</legend><div className="platform-options"><label><input type="radio" name="platform" value="mac" required />macOS</label><label><input type="radio" name="platform" value="linux" />Linux</label><label><input type="radio" name="platform" value="windows" />Windows</label></div></fieldset>
      <div className="field field-full"><label htmlFor="research">Research or workflow needs</label><textarea id="research" name="research" required minLength={10} /></div>
    </div>
    <p className="muted">By submitting, you agree to our <a href="/terms">Terms of Service</a> and acknowledge our <a href="/privacy">Privacy Policy</a>.</p>
    <button className="button" type="submit" disabled={state.kind === 'submitting'}>{state.kind === 'submitting' ? 'Submitting…' : 'Submit request'}</button>
    <p className={`form-status ${state.kind === 'success' ? 'success' : ''}`} role="status" aria-live="polite">{state.message}</p>
  </form>;
}
