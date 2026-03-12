import { MemberProvider } from '@/integrations';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { ScrollToTop } from '@/lib/scroll-to-top';
import ErrorPage from '@/integrations/errorHandlers/ErrorPage';
import HomePage from '@/components/pages/HomePage';
import GiroNoAsfaltoPage from '@/components/pages/GiroNoAsfaltoPage';
import LuxuryShowroomPage from '@/components/pages/LuxuryShowroomPage';
import Luxo1Page from '@/components/pages/Luxo1Page';
import GamePage from '@/components/pages/GamePage';
import CasaPage from '@/components/pages/CasaPage';
import BarracoPage from '@/components/pages/BarracoPage';

// Layout component that includes ScrollToTop
function Layout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
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
        element: <HomePage />,
        routeMetadata: {
          pageIdentifier: 'home',
        },
      },
      {
        path: "giro-no-asfalto",
        element: <GiroNoAsfaltoPage />,
        routeMetadata: {
          pageIdentifier: 'giro-no-asfalto',
        },
      },
      {
        path: "luxury-showroom",
        element: <LuxuryShowroomPage />,
        routeMetadata: {
          pageIdentifier: 'luxury-showroom',
        },
      },
      {
        path: "luxo-1",
        element: <Luxo1Page />,
        routeMetadata: {
          pageIdentifier: 'luxo-1',
        },
      },
      {
        path: "game",
        element: <GamePage />,
        routeMetadata: {
          pageIdentifier: 'game',
        },
      },
      {
        path: "casa",
        element: <CasaPage />,
        routeMetadata: {
          pageIdentifier: 'casa',
        },
      },
      {
        path: "barraco",
        element: <BarracoPage />,
        routeMetadata: {
          pageIdentifier: 'barraco',
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
