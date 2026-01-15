import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Résolution des chemins
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@store': path.resolve(__dirname, './src/store'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
  },

  // Configuration du serveur de développement
  server: {
    port: 3000,
    open: true,
    host: true,
  },

  // Configuration du build de production
  build: {
    // Dossier de sortie
    outDir: 'dist',

    // Générer des source maps (désactiver en production pour la sécurité)
    sourcemap: false,

    // Minification avec terser (plus agressif que esbuild)
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,      // Retirer les console.log
        drop_debugger: true,     // Retirer les debugger
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      format: {
        comments: false,         // Retirer les commentaires
      },
    },

    // Taille maximale des chunks (en Ko)
    chunkSizeWarningLimit: 1000,

    // Optimisations Rollup
    rollupOptions: {
      output: {
        // Code splitting manuel pour optimiser le chargement
        manualChunks: (id) => {
          // Vendor chunks pour les dépendances React
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }

            // Redux et state management
            if (id.includes('redux') || id.includes('@reduxjs')) {
              return 'redux-vendor';
            }

            // Autres dépendances
            return 'vendor';
          }
        },

        // Nommage des fichiers pour le cache busting
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },

    // Optimisations CSS
    cssCodeSplit: true,
    cssMinify: true,

    // Optimisations des assets
    assetsInlineLimit: 4096, // 4kb - inline les petits assets en base64
  },

  // Optimisations des dépendances
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})
