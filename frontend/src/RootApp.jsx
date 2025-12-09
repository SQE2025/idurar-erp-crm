import './style/app.css';

import { Suspense, lazy } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '@/redux/store';
import PageLoader from '@/components/PageLoader';
import SentryTestButton from '@/components/SentryTestButton';

const IdurarOs = lazy(() => import('./apps/IdurarOs'));

export default function RoutApp() {
  const showSentryTest = import.meta.env.VITE_SHOW_SENTRY_TEST === 'true';

  return (
    <BrowserRouter>
      <Provider store={store}>
        <Suspense fallback={<PageLoader />}>
          <IdurarOs />
          {showSentryTest && <SentryTestButton />}
        </Suspense>
      </Provider>
    </BrowserRouter>
  );
}
