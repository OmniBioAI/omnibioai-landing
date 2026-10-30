import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { App } from './App';
import { routeFromPath } from './config';
import './styles.css';

const root = document.getElementById('root');
if (!root) throw new Error('Application root was not found.');

hydrateRoot(root, <StrictMode><App route={routeFromPath(window.location.pathname)} /></StrictMode>);
