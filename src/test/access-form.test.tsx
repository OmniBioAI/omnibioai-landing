import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, vi } from 'vitest';
import { AccessForm } from '../components/AccessForm';

afterEach(() => vi.unstubAllGlobals());

async function completeForm() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('First name'), 'Ada');
  await user.type(screen.getByLabelText('Last name'), 'Lovelace');
  await user.type(screen.getByLabelText('Work or institutional email'), 'ada@example.edu');
  await user.type(screen.getByLabelText('Institution'), 'Analytical Engine Lab');
  await user.selectOptions(screen.getByLabelText('Role'), 'Research scientist');
  await user.selectOptions(screen.getByLabelText('Primary use case'), 'Multi-omics analysis');
  await user.click(screen.getByLabelText('Linux'));
  await user.type(screen.getByLabelText('Research or workflow needs'), 'Reproducible multi-omics workflows');
  await user.click(screen.getByRole('button', { name: 'Submit request' }));
}

describe('AccessForm', () => {
  it('shows success only after an approved API response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ message: 'ok' }) });
    vi.stubGlobal('fetch', fetchMock);
    render(<AccessForm />);
    await completeForm();
    expect(await screen.findByText(/Request submitted/)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('fails closed when the integration rejects the request', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'Service unavailable' }) }));
    render(<AccessForm />);
    await completeForm();
    expect(await screen.findByText('Service unavailable')).toBeInTheDocument();
    expect(screen.queryByText(/Request submitted/)).not.toBeInTheDocument();
  });
});
