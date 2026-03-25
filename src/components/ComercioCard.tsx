import { motion } from 'framer-motion';
import {
  ComercioKey,
  COMERCIOS_CONFIG,
  calcularValorLavagem,
  calcularTempoLavagem,
  calcularTaxaAplicada,
} from '@/types/comercios';
import { ComercioData } from '@/types/comercios';
import { Button } from '@/components/ui/button';

interface ComercioCardProps {
  comercioKey: ComercioKey;
  data: ComercioData;
  onIniciar: () => void;
  onFinalizar: () => void;
  isLoading?: boolean;
  dirtyMoney: number;
}

export default function ComercioCard({
  comercioKey,
  data,
  onIniciar,
  onFinalizar,
  isLoading = false,
  dirtyMoney,
}: ComercioCardProps) {
  const config = COMERCIOS_CONFIG[comercioKey];
  const valorLavagem = calcularValorLavagem(comercioKey, data.nivelNegocio);
  const tempoLavagem = calcularTempoLavagem(comercioKey, data.nivelNegocio);
  const taxaAplicada = calcularTaxaAplicada(comercioKey, data.nivelTaxa);

  const cleanMoneyGanho = Math.floor(valorLavagem * (1 - taxaAplicada / 100));

  const tempoRestante = data.horarioFim ? Math.max(0, data.horarioFim - Date.now()) : 0;

  const hoje = new Date().toDateString();
  const jaUsouHoje = data.ultimaDataUso === hoje;

  const podeIniciar = !data.emAndamento && !jaUsouHoje && dirtyMoney >= valorLavagem;

  const formatarTempo = (ms: number) => {
    const totalSegundos = Math.ceil(ms / 1000);
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;

    if (horas > 0) return `${horas}h ${minutos}m ${segundos}s`;
    if (minutos > 0) return `${minutos}m ${segundos}s`;
    return `${segundos}s`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900 to-slate-800 border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-500/60 transition-all"
    >
      <div className="mb-4">
        <h3 className="text-xl font-heading text-cyan-400 mb-2">{config.nome}</h3>
        <div className="flex justify-between text-sm text-gray-300 mb-3">
          <span>Nível: {data.nivelNegocio}</span>
          <span>Eficiência: {data.nivelTaxa}</span>
        </div>
      </div>

      <div className="space-y-2 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Valor de Lavagem:</span>
          <span className="text-green-400 font-semibold">R$ {valorLavagem}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Tempo:</span>
          <span className="text-blue-400">{formatarTempo(tempoLavagem)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Taxa:</span>
          <span className="text-orange-400">{taxaAplicada.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Retorno:</span>
          <span className="text-yellow-400">R$ {cleanMoneyGanho}</span>
        </div>
      </div>

      {data.emAndamento && (
        <div className="mb-4 p-3 bg-blue-900/30 border border-blue-500/50 rounded">
          <div className="text-sm text-blue-300 mb-2">
            {tempoRestante > 0 ? `Tempo restante: ${formatarTempo(tempoRestante)}` : 'Pronto para finalizar!'}
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full"
              initial={{ width: '100%' }}
              animate={{ width: `${Math.max(0, (tempoRestante / tempoLavagem) * 100)}%` }}
              transition={{ duration: 0.3, ease: 'linear' }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {!data.emAndamento ? (
          <Button
            onClick={onIniciar}
            disabled={!podeIniciar || isLoading}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50"
          >
            {isLoading ? 'Iniciando...' : 'Iniciar'}
          </Button>
        ) : (
          <Button
            onClick={onFinalizar}
            disabled={tempoRestante > 0 || isLoading}
            className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 disabled:opacity-50"
          >
            {isLoading ? 'Finalizando...' : tempoRestante > 0 ? 'Aguardando...' : 'Finalizar'}
          </Button>
        )}
      </div>

      {!podeIniciar && !data.emAndamento && (
        <div className="mt-3 text-xs text-red-400 text-center">
          {dirtyMoney < valorLavagem
            ? 'Dinheiro sujo insuficiente'
            : jaUsouHoje
              ? 'Limite diário atingido'
              : 'Indisponível'}
        </div>
      )}
    </motion.div>
  );
}