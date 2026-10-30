import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CatalogSection } from '../components/CatalogSection';

const groups = [
  { key: 'one', title: 'One', description: 'First', items: [{ href: 'https://example.com/a', name: 'A', description: 'A item' }] },
  { key: 'two', title: 'Two', description: 'Second', items: [{ href: 'https://example.com/b', name: 'B', description: 'B item' }] },
];

it('filters catalog cards and announces the result count', async () => {
  const user = userEvent.setup();
  render(<CatalogSection id="catalog" eyebrow="Catalog" title="Test catalog" intro="Intro" groups={groups} docsHref="https://example.com" />);
  await user.click(screen.getByRole('button', { name: 'One (1)' }));
  expect(screen.getByText('Showing 1 of 2')).toBeInTheDocument();
  expect(screen.getByText('A item')).toBeInTheDocument();
  expect(screen.queryByText('B item')).not.toBeInTheDocument();
});
