import { renderToString } from 'react-dom/server';
import { App } from './App';
import { routeFromPath } from './config';
import { renderHead } from './seo';
import './styles.css';

export function render(pathname: string) {
  const route = routeFromPath(pathname);
  return { html: renderToString(<App route={route} />), head: renderHead(route), route };
}
