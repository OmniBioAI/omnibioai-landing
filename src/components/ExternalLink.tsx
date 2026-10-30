import type { AnchorHTMLAttributes, PropsWithChildren } from 'react';

export function ExternalLink({ children, ...props }: PropsWithChildren<AnchorHTMLAttributes<HTMLAnchorElement>>) {
  return <a {...props} target="_blank" rel="noopener noreferrer">{children}</a>;
}
