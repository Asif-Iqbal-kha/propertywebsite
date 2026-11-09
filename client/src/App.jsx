import { Suspense, useEffect } from 'react';
import { Outlet, Route, Routes, useLocation } from 'react-router';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import QuickContact from './components/QuickContact.jsx';
import { PageFallback } from './components/ui.jsx';
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';
import { Pages, warmPublicRoutes } from './routes.js';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

function PublicLayout() {
  useEffect(() => {
    warmPublicRoutes();
  }, []);

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[60] rounded-full bg-gold-400 px-4 py-2 font-semibold text-ink-950 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <QuickContact />
    </>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="properties" element={<Pages.Properties />} />
          <Route path="properties/:slug" element={<Pages.PropertyDetail />} />
          <Route path="society" element={<Pages.Society />} />
          <Route path="payment-plans" element={<Pages.PaymentPlans />} />
          <Route path="gallery" element={<Pages.Gallery />} />
          <Route path="about" element={<Pages.About />} />
          <Route path="contact" element={<Pages.Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route
          path="admin/*"
          element={
            <Suspense fallback={<PageFallback />}>
              <Pages.AdminApp />
            </Suspense>
          }
        />
      </Routes>
    </>
  );
}
