import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { RelayEnvironmentProvider } from 'react-relay';
import { RelayEnv } from './RelayEnvironment';
import { router } from './router';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RelayEnvironmentProvider environment={RelayEnv}>
      <Suspense fallback={<div>Loading CodeHub...</div>}>
        <RouterProvider router={router} />
      </Suspense>
    </RelayEnvironmentProvider>
  </React.StrictMode>
);
