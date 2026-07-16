import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import relay from 'vite-plugin-relay';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    react(),
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
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Split out relay since it's large and specific to graphql operations
            if (id.includes('node_modules/relay-runtime') || id.includes('node_modules/react-relay')) {
              return 'relay';
            }
            // Put exact React core libraries together
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
