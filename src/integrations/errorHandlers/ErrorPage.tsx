import { useRouteError } from 'react-router-dom';

export default function ErrorPage() {
  const error = useRouteError() as any;

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">Erro</h1>
        <p className="text-xl mb-4">Algo deu errado</p>
        {error?.message && (
          <p className="text-sm text-gray-400">{error.message}</p>
        )}
        <a
          href="/"
          className="inline-block mt-6 px-6 py-3 bg-primary text-white rounded hover:bg-primary/80"
        >
          Voltar para Home
        </a>
      </div>
    </div>
  );
}
