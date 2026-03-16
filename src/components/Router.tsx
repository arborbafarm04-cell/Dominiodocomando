import { MemberProvider } from '@/integrations';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { ScrollToTop } from '@/lib/scroll-to-top';
import ErrorPage from '@/integrations/errorHandlers/ErrorPage';
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const HomePage = lazy(() => import('@/components/pages/HomePage'));
const GiroNoAsfaltoPage = lazy(() => import('@/components/pages/GiroNoAsfaltoPage'));
const LuxuryShowroomPage = lazy(() => import('@/components/pages/LuxuryShowroomPage'));
const Luxo1Page = lazy(() => import('@/components/pages/Luxo1Page'));
const Luxo2Page = lazy(() => import('@/components/pages/Luxo2Page'));
const Luxo3Page = lazy(() => import('@/components/pages/Luxo3Page'));
const Luxo4Page = lazy(() => import('@/components/pages/Luxo4Page'));
const Luxo5Page = lazy(() => import('@/components/pages/Luxo5Page'));
const Luxo6Page = lazy(() => import('@/components/pages/Luxo6Page'));
const Luxo7Page = lazy(() => import('@/components/pages/Luxo7Page'));
const Luxo8Page = lazy(() => import('@/components/pages/Luxo8Page'));
const Luxo9Page = lazy(() => import('@/components/pages/Luxo9Page'));
const Luxo10Page = lazy(() => import('@/components/pages/Luxo10Page'));
const Luxo11Page = lazy(() => import('@/components/pages/Luxo11Page'));
const Luxo12Page = lazy(() => import('@/components/pages/Luxo12Page'));
const Luxo13Page = lazy(() => import('@/components/pages/Luxo13Page'));
const Luxo14Page = lazy(() => import('@/components/pages/Luxo14Page'));
const Luxo15Page = lazy(() => import('@/components/pages/Luxo15Page'));
const GamePage = lazy(() => import('@/components/pages/GamePage'));
const Game2Page = lazy(() => import('@/components/pages/Game2Page'));
const CasaPage = lazy(() => import('@/components/pages/CasaPage'));
const BarracoPage = lazy(() => import('@/components/pages/BarracoPage'));
const ProjectsPage = lazy(() => import('@/components/pages/ProjectsPage'));
const BriberyGuardPage = lazy(() => import('@/components/pages/BriberyGuardPage'));
const BriberyInvestigadorPage = lazy(() => import('@/components/pages/BriberyInvestigadorPage'));
const BriberyDelegadoPage = lazy(() => import('@/components/pages/BriberyDelegadoPage'));
const BriberyVereadorPage = lazy(() => import('@/components/pages/BriberyVereadorPage'));
const BriberyPrefeitoPage = lazy(() => import('@/components/pages/BriberyPrefeitoPage'));
const BriberyPromotorPage = lazy(() => import('@/components/pages/BriberyPromotorPage'));
const BriberyJuizPage = lazy(() => import('@/components/pages/BriberyJuizPage'));
const BriberySecretarioPage = lazy(() => import('@/components/pages/BriberySecretarioPage'));
const BriberyGovernadorPage = lazy(() => import('@/components/pages/BriberyGovernadorPage'));
const BriberyMinistroPage = lazy(() => import('@/components/pages/BriberyMinistroPage'));
const BriberyPresidentePage = lazy(() => import('@/components/pages/BriberyPresidentePage'));

// Layout component that includes ScrollToTop
function Layout() {
  return (
    <>
      <ScrollToTop />
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
        path: "game2",
        element: <Game2Page />,
        routeMetadata: {
          pageIdentifier: 'game2',
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
        path: "bribery-investigador",
        element: <BriberyInvestigadorPage />,
        routeMetadata: {
          pageIdentifier: 'bribery-investigador',
        },
      },
      {
        path: "bribery-delegado",
        element: <BriberyDelegadoPage />,
        routeMetadata: {
          pageIdentifier: 'bribery-delegado',
        },
      },
      {
        path: "bribery-vereador",
        element: <BriberyVereadorPage />,
        routeMetadata: {
          pageIdentifier: 'bribery-vereador',
        },
      },
      {
        path: "bribery-prefeito",
        element: <BriberyPrefeitoPage />,
        routeMetadata: {
          pageIdentifier: 'bribery-prefeito',
        },
      },
      {
        path: "bribery-promotor",
        element: <BriberyPromotorPage />,
        routeMetadata: {
          pageIdentifier: 'bribery-promotor',
        },
      },
      {
        path: "bribery-juiz",
        element: <BriberyJuizPage />,
        routeMetadata: {
          pageIdentifier: 'bribery-juiz',
        },
      },
      {
        path: "bribery-secretario",
        element: <BriberySecretarioPage />,
        routeMetadata: {
          pageIdentifier: 'bribery-secretario',
        },
      },
      {
        path: "bribery-governador",
        element: <BriberyGovernadorPage />,
        routeMetadata: {
          pageIdentifier: 'bribery-governador',
        },
      },
      {
        path: "bribery-ministro",
        element: <BriberyMinistroPage />,
        routeMetadata: {
          pageIdentifier: 'bribery-ministro',
        },
      },
      {
        path: "bribery-presidente",
        element: <BriberyPresidentePage />,
        routeMetadata: {
          pageIdentifier: 'bribery-presidente',
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
