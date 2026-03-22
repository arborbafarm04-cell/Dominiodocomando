import { MemberProvider } from '@/integrations';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { ScrollToTop } from '@/lib/scroll-to-top';
import ErrorPage from '@/integrations/errorHandlers/ErrorPage';
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const HomePage = lazy(() => import('@/components/pages/HomePage'));
const GiroNoAsfaltoPage = lazy(() => import('@/components/pages/GiroNoAsfaltoPage'));
const LuxuryShowroomPage = lazy(() => import('@/components/pages/LuxuryShowroomPage'));
const BarracoPage = lazy(() => import('@/components/pages/BarracoPage'));
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
const StarMapPage = lazy(() => import('@/components/pages/StarMapPage'));
const ResetLuxuryPage = lazy(() => import('@/components/pages/ResetLuxuryPage'));
const InvestmentSkillTreePage = lazy(() => import('@/components/pages/InvestmentSkillTreePage'));

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
        path: "star-map",
        element: <StarMapPage />,
        routeMetadata: {
          pageIdentifier: 'star-map',
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
        path: "barraco",
        element: <BarracoPage />,
        routeMetadata: {
          pageIdentifier: 'barraco',
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
        path: "reset-luxury",
        element: <ResetLuxuryPage />,
        routeMetadata: {
          pageIdentifier: 'reset-luxury',
        },
      },
      {
        path: "investment-center",
        element: <InvestmentSkillTreePage />,
        routeMetadata: {
          pageIdentifier: 'investment-center',
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
