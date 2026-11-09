import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { SITE_DEFAULTS } from '../server/src/data/defaults.js';
import { SAMPLE_PROPERTIES } from '../server/src/data/samples.js';

const API = 'http://localhost:5000';

/**
 * UI preview without a database: `npm run preview:ui`.
 * Serves the verified default content + the clearly-labelled SAMPLE listings.
 */
function mockApi() {
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const items = SAMPLE_PROPERTIES.map((p, i) => {
    const ref = `PH-${1001 + i}`;
    return {
      _id: `sample${i}`,
      ref,
      slug: `${slug(p.title)}-${ref.toLowerCase()}`,
      status: 'available',
      featured: false,
      images: [],
      features: [],
      location: {},
      installment: { available: false },
      bedrooms: null,
      bathrooms: null,
      ...p,
      areaMarla: p.area.unit === 'kanal' ? p.area.value * 20 : p.area.value,
      isSample: true,
      views: 0,
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    };
  });

  const send = (res, code, body) => {
    res.statusCode = code;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(body));
  };

  const handler = (req, res, next) => {
        {
        if (!req.url.startsWith('/api/')) return next();
        const url = new URL(req.url, 'http://localhost');
        const path = url.pathname;
        const q = Object.fromEntries(url.searchParams);

        if (path === '/api/settings') return send(res, 200, SITE_DEFAULTS);
        if (path === '/api/gallery') return send(res, 200, { items: [] });
        if (path === '/api/inquiries' && req.method === 'POST') return send(res, 201, { ok: true });

        const visible = items.filter((p) => p.status !== 'sold');
        if (path === '/api/properties/facets') {
          const count = (key) => visible.reduce((m, p) => ({ ...m, [p[key]]: (m[p[key]] || 0) + 1 }), {});
          return send(res, 200, { types: count('type'), sizes: count('areaMarla'), purposes: count('purpose'), total: visible.length });
        }

        if (path === '/api/properties') {
          let list = q.status ? items.filter((p) => p.status === q.status) : visible;
          if (q.purpose) list = list.filter((p) => p.purpose === q.purpose);
          if (q.type) list = list.filter((p) => p.type === q.type);
          if (q.size) {
            const [n, unit] = q.size.split('-');
            list = list.filter((p) => p.areaMarla === (unit === 'kanal' ? n * 20 : Number(n)));
          }
          if (q.minPrice) list = list.filter((p) => p.price != null && p.price >= Number(q.minPrice));
          if (q.maxPrice) list = list.filter((p) => p.price != null && p.price <= Number(q.maxPrice));
          if (q.q) list = list.filter((p) => `${p.title} ${p.ref} ${p.location?.block || ''}`.toLowerCase().includes(q.q.toLowerCase()));
          const priced = (dir) => (a, b) => (a.price == null) - (b.price == null) || dir * ((a.price || 0) - (b.price || 0));
          const sorts = {
            'price-asc': priced(1),
            'price-desc': priced(-1),
            'size-asc': (a, b) => a.areaMarla - b.areaMarla,
            'size-desc': (a, b) => b.areaMarla - a.areaMarla,
          };
          list = [...list].sort(sorts[q.sort] || ((a, b) => b.featured - a.featured));
          const limit = Number(q.limit) || 12;
          const page = Number(q.page) || 1;
          return send(res, 200, { items: list.slice((page - 1) * limit, page * limit), total: list.length, page, pages: Math.max(Math.ceil(list.length / limit), 1), limit });
        }

        const detail = /^\/api\/properties\/([^/]+)$/.exec(path);
        if (detail) {
          const p = items.find((x) => x.slug === detail[1]);
          if (!p) return send(res, 404, { error: 'This property could not be found.' });
          return send(res, 200, { property: p, similar: visible.filter((x) => x !== p && x.type === p.type).slice(0, 3) });
        }

        if (path.startsWith('/api/auth') || path.startsWith('/api/admin')) {
          return send(res, 401, { error: 'Preview mode — the admin panel needs the database (npm run dev).' });
        }
        return send(res, 404, { error: 'Not found.' });
        }
  };

  return {
    name: 'mock-api',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), mode === 'mock' && mockApi()].filter(Boolean),
  server: {
    port: 5173,
    proxy: {
      '/api': API,
      '/uploads': API,
      '/sitemap.xml': API,
      '/robots.txt': API,
    },
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        // Framework code changes rarely, so it gets its own long-cached file.
        manualChunks(id) {
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|scheduler|cookie|set-cookie-parser)[\\/]/.test(id)) return 'react';
          return undefined;
        },
      },
    },
  },
}));
