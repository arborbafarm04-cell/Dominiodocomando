import { lazy, Suspense } from 'react';
import { MemberProvider } from '@/integrations';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { ScrollToTop } from '@/lib/scroll-to-top';
import { Toaster } from '@/components/ui/toaster';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import ErrorPage from '@/integrations/errorHandlers/ErrorPage';

// Lazy load page components
const HomePage = lazy(() => import('@/components/pages/HomePage'));
const GiroNoAsfaltoPage = lazy(() => import('@/components/pages/GiroNoAsfaltoPage'));
const LuxuryShowroomPage = lazy(() => import('@/components/pages/LuxuryShowroomPage'));
const Luxo1Page = lazy(() => import('@/components/pages/Luxo1Page'));
const GamePage = lazy(() => import('@/components/pages/GamePage'));
const CasaPage = lazy(() => import('@/components/pages/CasaPage'));
const BarracoPage = lazy(() => import('@/components/pages/BarracoPage'));
const AboutPage = lazy(() => import('@/components/pages/AboutPage'));
const ContactPage = lazy(() => import('@/components/pages/ContactPage'));
const BriberyPage = lazy(() => import('@/components/pages/BriberyPage'));

// Layout component that includes ScrollToTop and Toaster
function Layout() {
  return (
    <>
      <ScrollToTop />
      <Toaster />
      <Suspense fallback={<LoadingSpinner />}>
        <Outlet />
      </Suspense>
    </>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <HomePage />
          </Suspense>
        ),
        routeMetadata: {
          pageIdentifier: 'home',
        },
      },
      {
        path: "giro-no-asfalto",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <GiroNoAsfaltoPage />
          </Suspense>
        ),
        routeMetadata: {
          pageIdentifier: 'giro-no-asfalto',
        },
      },
      {
        path: "luxury-showroom",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <LuxuryShowroomPage />
          </Suspense>
        ),
        routeMetadata: {
          pageIdentifier: 'luxury-showroom',
        },
      },
      {
        path: "luxo-1",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Luxo1Page />
          </Suspense>
        ),
        routeMetadata: {
          pageIdentifier: 'luxo-1',
        },
      },
      {
        path: "game",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <GamePage />
          </Suspense>
        ),
        routeMetadata: {
          pageIdentifier: 'game',
        },
      },
      {
        path: "casa",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <CasaPage />
          </Suspense>
        ),
        routeMetadata: {
          pageIdentifier: 'casa',
        },
      },
      {
        path: "barraco",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <BarracoPage />
          </Suspense>
        ),
        routeMetadata: {
          pageIdentifier: 'barraco',
        },
      },
      {
        path: "about",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AboutPage />
          </Suspense>
        ),
        routeMetadata: {
          pageIdentifier: 'about',
        },
      },
      {
        path: "contact",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ContactPage />
          </Suspense>
        ),
        routeMetadata: {
          pageIdentifier: 'contact',
        },
      },
      {
        path: "bribery",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <BriberyPage />
          </Suspense>
        ),
        routeMetadata: {
          pageIdentifier: 'bribery',
        },
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
], {
  basename: import.meta.env.BASE_NAME,
});

export default function AppRouter() {
  return (
    <MemberProvider>
      <RouterProvider router={router} />
    </MemberProvider>
  );
}
