import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  // Expose both VITE_* and NEXT_PUBLIC_* variables to the client bundle,
  // so the Supabase credentials can be named NEXT_PUBLIC_SUPABASE_URL /
  // NEXT_PUBLIC_SUPABASE_ANON_KEY on Vercel.
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  server: {
    port: 3000,
    host: true
  }
});
