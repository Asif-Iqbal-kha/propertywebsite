import { lazy } from 'react';

/** Route chunks. Each page loads on demand, and can be prefetched on hover. */
export const loaders = {
  '/properties': () => import('./pages/Properties.jsx'),
  '/property': () => import('./pages/PropertyDetail.jsx'),
  '/society': () => import('./pages/Society.jsx'),
  '/payment-plans': () => import('./pages/PaymentPlans.jsx'),
  '/gallery': () => import('./pages/Gallery.jsx'),
  '/about': () => import('./pages/About.jsx'),
  '/contact': () => import('./pages/Contact.jsx'),
  '/admin': () => import('./admin/AdminApp.jsx'),
};

export const Pages = {
  Properties: lazy(loaders['/properties']),
  PropertyDetail: lazy(loaders['/property']),
  Society: lazy(loaders['/society']),
  PaymentPlans: lazy(loaders['/payment-plans']),
  Gallery: lazy(loaders['/gallery']),
  About: lazy(loaders['/about']),
  Contact: lazy(loaders['/contact']),
  AdminApp: lazy(loaders['/admin']),
};

export function prefetchRoute(path) {
  const key = path.startsWith('/properties/') ? '/property' : path.split('?')[0];
  loaders[key]?.().catch(() => {});
}

/** After the first page is idle, quietly warm up the other public pages. */
export function warmPublicRoutes() {
  const run = () => ['/properties', '/property', '/society', '/payment-plans', '/contact', '/about', '/gallery'].forEach(prefetchRoute);
  if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 4000 });
  else setTimeout(run, 2500);
}
