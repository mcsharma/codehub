import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { RelayEnvironmentProvider } from 'react-relay';
import { RelayEnv } from '@ch/RelayEnvironment';
import App from '@ch/App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RelayEnvironmentProvider environment={RelayEnv}>
      <Suspense fallback={<div>Loading CodeHub...</div>}>
        <App />
      </Suspense>
    </RelayEnvironmentProvider>
  </React.StrictMode>
);
