import type { RouteId } from './config';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { AdminPage } from './pages/AdminPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App({ route }: { route: RouteId }) {
  switch (route) {
    case 'home': return <HomePage />;
    case 'about': return <AboutPage />;
    case 'privacy': return <PrivacyPage />;
    case 'terms': return <TermsPage />;
    case 'admin': return <AdminPage />;
    default: return <NotFoundPage />;
  }
}
