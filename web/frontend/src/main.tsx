import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { RelayEnvironmentProvider } from 'react-relay';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { RelayEnv } from './RelayEnvironment';
import { router } from './router';
import { theme } from './theme';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RelayEnvironmentProvider environment={RelayEnv}>
        <Suspense fallback={<div>Loading CodeHub...</div>}>
          <RouterProvider router={router} />
        </Suspense>
      </RelayEnvironmentProvider>
    </ThemeProvider>
  </React.StrictMode>
);
