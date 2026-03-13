import { MemberProvider } from '@/integrations';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { ScrollToTop } from '@/lib/scroll-to-top';
import ErrorPage from '@/integrations/errorHandlers/ErrorPage';
import HomePage from '@/components/pages/HomePage';
import GiroNoAsfaltoPage from '@/components/pages/GiroNoAsfaltoPage';
import LuxuryShowroomPage from '@/components/pages/LuxuryShowroomPage';
import Luxo1Page from '@/components/pages/Luxo1Page';
import Luxo2Page from '@/components/pages/Luxo2Page';
import Luxo3Page from '@/components/pages/Luxo3Page';
import Luxo4Page from '@/components/pages/Luxo4Page';
import Luxo5Page from '@/components/pages/Luxo5Page';
import Luxo6Page from '@/components/pages/Luxo6Page';
import Luxo7Page from '@/components/pages/Luxo7Page';
import Luxo8Page from '@/components/pages/Luxo8Page';
import Luxo9Page from '@/components/pages/Luxo9Page';
import Luxo10Page from '@/components/pages/Luxo10Page';
import Luxo11Page from '@/components/pages/Luxo11Page';
import Luxo12Page from '@/components/pages/Luxo12Page';
import Luxo13Page from '@/components/pages/Luxo13Page';
import Luxo14Page from '@/components/pages/Luxo14Page';
import Luxo15Page from '@/components/pages/Luxo15Page';
import GamePage from '@/components/pages/GamePage';
import CasaPage from '@/components/pages/CasaPage';
import BarracoPage from '@/components/pages/BarracoPage';
import ProjectsPage from '@/components/pages/ProjectsPage';
import BriberyGuardPage from '@/components/pages/BriberyGuardPage';

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
        path: "luxo-2",
        element: <Luxo2Page />,
        routeMetadata: {
          pageIdentifier: 'luxo-2',
        },
      },
      {
        path: "luxo-3",
        element: <Luxo3Page />,
        routeMetadata: {
          pageIdentifier: 'luxo-3',
        },
      },
      {
        path: "luxo-4",
        element: <Luxo4Page />,
        routeMetadata: {
          pageIdentifier: 'luxo-4',
        },
      },
      {
        path: "luxo-5",
        element: <Luxo5Page />,
        routeMetadata: {
          pageIdentifier: 'luxo-5',
        },
      },
      {
        path: "luxo-6",
        element: <Luxo6Page />,
        routeMetadata: {
          pageIdentifier: 'luxo-6',
        },
      },
      {
        path: "luxo-7",
        element: <Luxo7Page />,
        routeMetadata: {
          pageIdentifier: 'luxo-7',
        },
      },
      {
        path: "luxo-8",
        element: <Luxo8Page />,
        routeMetadata: {
          pageIdentifier: 'luxo-8',
        },
      },
      {
        path: "luxo-9",
        element: <Luxo9Page />,
        routeMetadata: {
          pageIdentifier: 'luxo-9',
        },
      },
      {
        path: "luxo-10",
        element: <Luxo10Page />,
        routeMetadata: {
          pageIdentifier: 'luxo-10',
        },
      },
      {
        path: "luxo-11",
        element: <Luxo11Page />,
        routeMetadata: {
          pageIdentifier: 'luxo-11',
        },
      },
      {
        path: "luxo-12",
        element: <Luxo12Page />,
        routeMetadata: {
          pageIdentifier: 'luxo-12',
        },
      },
      {
        path: "luxo-13",
        element: <Luxo13Page />,
        routeMetadata: {
          pageIdentifier: 'luxo-13',
        },
      },
      {
        path: "luxo-14",
        element: <Luxo14Page />,
        routeMetadata: {
          pageIdentifier: 'luxo-14',
        },
      },
      {
        path: "luxo-15",
        element: <Luxo15Page />,
        routeMetadata: {
          pageIdentifier: 'luxo-15',
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
        path: "projects",
        element: <ProjectsPage />,
        routeMetadata: {
          pageIdentifier: 'projects',
        },
      },
      {
        path: "bribery-guard",
        element: <BriberyGuardPage />,
        routeMetadata: {
          pageIdentifier: 'bribery-guard',
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
