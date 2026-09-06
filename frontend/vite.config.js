import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
let basicSsl;
try {
  basicSsl = (await import('@vitejs/plugin-basic-ssl')).default;
} catch (e) {
  basicSsl = null;
}

const filterUrlsPlugin = () => ({
  name: 'filter-network-urls',
  configureServer(server) {
    const originalPrintUrls = server.printUrls;
    server.printUrls = () => {
      if (server.resolvedUrls && server.resolvedUrls.network) {
        // Hide Docker (172.x) and VirtualBox (192.168.56.x) IPs from terminal output
        server.resolvedUrls.network = server.resolvedUrls.network.filter(
          url => !url.includes('172.') && !url.includes('192.168.56.')
        );
      }
      originalPrintUrls();
    };
  }
});

export default defineConfig({
  plugins: [react(), ...(basicSsl ? [basicSsl()] : []), filterUrlsPlugin()],
  server: {
    port: 5173,
    host: true,
    strictPort: false,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
      },
    },
  },
})
