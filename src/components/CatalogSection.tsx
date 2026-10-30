import { useState } from 'react';
import { ExternalLink } from './ExternalLink';

export interface CatalogGroup {
  key: string;
  title: string;
  description: string;
  items: Array<{ href: string; name: string; description: string }>;
}

export function CatalogSection({
  id,
  eyebrow,
  title,
  intro,
  groups,
  docsHref,
}: {
  id: string;
  eyebrow: string;
  title: string;
  intro: string;
  groups: CatalogGroup[];
  docsHref: string;
}) {
  const [selected, setSelected] = useState('all');
  const total = groups.reduce((sum, group) => sum + group.items.length, 0);
  const visible = selected === 'all' ? groups : groups.filter((group) => group.key === selected);

  return <section className="section" id={id}>
    <div className="shell">
      <div className="section-head">
        <div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>
        <p>{intro} <ExternalLink href={docsHref}>Browse the maintained catalog ↗</ExternalLink></p>
      </div>
      <div className="filter-row" aria-label={`Filter ${title}`}>
        <button type="button" aria-pressed={selected === 'all'} onClick={() => setSelected('all')}>All ({total})</button>
        {groups.map((group) => <button type="button" key={group.key} aria-pressed={selected === group.key} onClick={() => setSelected(group.key)}>{group.title} ({group.items.length})</button>)}
      </div>
      <div aria-live="polite" className="muted">Showing {visible.reduce((sum, group) => sum + group.items.length, 0)} of {total}</div>
      {visible.map((group) => <div className="catalog-group" key={group.key}>
        <div className="catalog-group-head"><div><h3>{group.title}</h3><p className="muted">{group.description}</p></div><span>{group.items.length}</span></div>
        <div className="catalog-grid">
          {group.items.map((item) => <ExternalLink className="catalog-card" href={item.href} key={`${group.key}-${item.name}`}>
            <strong>{item.name}</strong><span>{item.description}</span>
          </ExternalLink>)}
        </div>
      </div>)}
    </div>
  </section>;
}
