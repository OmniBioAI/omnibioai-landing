import type { PropsWithChildren } from 'react';
import { Footer } from './Footer';
import { Header } from './Header';

export function PageShell({ children, compact = false }: PropsWithChildren<{ compact?: boolean }>) {
  return <>
    <Header compact={compact} />
    {children}
    <Footer />
  </>;
}
