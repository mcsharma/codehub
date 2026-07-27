import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import relay from 'vite-plugin-relay';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react({
      babel: {
        // Suppresses Babel deoptimization warnings for large chunks > 500KB (like pre-bundled node_modules)
        compact: true,
      },
    }),
    relay,
    tsconfigPaths(),
  ],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/graphql': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('node_modules/relay-runtime') || id.includes('node_modules/react-relay')) {
              return 'relay';
            }
            if (
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/scheduler/')
            ) {
              return 'react-core';
            }
            return 'vendor';
          }
        },
      },
    },
  },
});
