import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { useMoneyLaunderingStore } from '@/store/moneyLaunderingStore';

interface MoneyLaunderingBusinessProps {
  businessId: string;
  businessName: string;
  initialValue: number;
  initialRate: number;
  baseTime: number;
  businessImage: string;
  currentRate: number;
  currentMaxValue: number;
  currentTimeMultiplier: number;
}

export default function MoneyLaunderingBusiness({
  businessId,
  businessName,
  initialValue,
  initialRate,
  baseTime,
  businessImage,
  currentRate,
  currentMaxValue,
  currentTimeMultiplier,
}: MoneyLaunderingBusinessProps) {
  const [launderAmount, setLaunderAmount] = useState<number>(initialValue);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [completedAmount, setCompletedAmount] = useState<number>(0);

  const { canOperateToday, addOperation, getActiveOperation } = useMoneyLaunderingStore();
  const activeOp = getActiveOperation(businessId);
  const canOperate = canOperateToday(businessId);

  // Sync with active operation
  useEffect(() => {
    if (activeOp && activeOp.status === 'processing') {
      setIsProcessing(true);
    } else if (!activeOp && isProcessing) {
      setIsProcessing(false);
    }
  }, [activeOp?.businessId, activeOp?.status]);

  // Update timer every 100ms - FIXED: Optimized dependencies
  useEffect(() => {
    if (!isProcessing || !activeOp) return;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - new Date(activeOp.startedAt).getTime()) / 1000;
      const remaining = Math.max(0, activeOp.completionTime - elapsed);
      
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        setIsProcessing(false);
        setCompletedAmount(activeOp.cleanedAmount);
        setTimeRemaining(0);
      }
    }, 100); // Update every 100ms for smooth animation

    return () => clearInterval(interval);
  }, [isProcessing, activeOp?.businessId, activeOp?.status]);

  const handleLaunder = () => {
    if (!canOperate || isProcessing || launderAmount <= 0 || launderAmount > currentMaxValue) {
      return;
    }

    const cleanedAmount = launderAmount * (1 - currentRate / 100);
    const operationTime = (baseTime * currentTimeMultiplier * launderAmount) / initialValue;

    const operation = {
      businessId,
      businessName,
      amount: launderAmount,
      rate: currentRate,
      timeRemaining: operationTime,
      completionTime: operationTime,
      cleanedAmount,
      status: 'processing' as const,
      startedAt: new Date(),
      lastOperationDate: new Date().toISOString().split('T')[0],
    };

    addOperation(operation);
    setIsProcessing(true);
    setTimeRemaining(operationTime);
    setCompletedAmount(0);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const cleanedAmount = launderAmount * (1 - currentRate / 100);
  const operationTime = (baseTime * currentTimeMultiplier * launderAmount) / initialValue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-6 border border-cyan-500/30 hover:border-cyan-500/60 transition-all"
    >
      {/* Business Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-heading font-bold text-cyan-400 mb-1">{businessName}</h3>
          <p className="text-sm text-gray-400">
            Taxa: <span className="text-orange-400 font-semibold">{currentRate.toFixed(1)}%</span>
          </p>
        </div>
        {businessImage && (
          <Image
            src={businessImage}
            alt={businessName}
            width={80}
            height={80}
            className="rounded-lg object-cover border border-cyan-500/30"
          />
        )}
      </div>

      {/* Business Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div className="bg-slate-800/50 rounded p-2">
          <p className="text-gray-400 text-xs">Valor Máximo</p>
          <p className="text-cyan-400 font-semibold">${currentMaxValue.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/50 rounded p-2">
          <p className="text-gray-400 text-xs">Tempo Base</p>
          <p className="text-cyan-400 font-semibold">{baseTime}h</p>
        </div>
      </div>

      {/* Amount Input */}
      <div className="mb-4">
        <label className="text-sm text-gray-400 mb-2 block">Valor a Lavar</label>
        <input
          type="number"
          value={launderAmount}
          onChange={(e) => setLaunderAmount(Math.min(currentMaxValue, Math.max(0, Number(e.target.value))))}
          disabled={isProcessing || !canOperate}
          className="w-full bg-slate-800 border border-cyan-500/30 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
          max={currentMaxValue}
          min={0}
        />
      </div>

      {/* Preview */}
      {!isProcessing && (
        <div className="bg-slate-800/50 rounded p-3 mb-4 text-sm">
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Valor Limpo:</span>
            <span className="text-green-400 font-semibold">${cleanedAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Tempo Estimado:</span>
            <span className="text-cyan-400 font-semibold">{formatTime(operationTime)}</span>
          </div>
        </div>
      )}

      {/* Processing Status */}
      {isProcessing && (
        <div className="bg-slate-800/50 rounded p-3 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Processando...</span>
            <span className="text-cyan-400 font-semibold text-sm">{formatTime(timeRemaining)}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
              initial={{ width: '100%' }}
              animate={{ width: `${(timeRemaining / (activeOp?.completionTime || 1)) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          {completedAmount > 0 && (
            <p className="text-sm text-green-400 mt-2">
              ✓ Valor Limpo: ${completedAmount.toLocaleString()}
            </p>
          )}
        </div>
      )}

      {/* Action Button */}
      <Button
        onClick={handleLaunder}
        disabled={isProcessing || !canOperate || launderAmount <= 0 || launderAmount > currentMaxValue}
        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 rounded transition-all"
      >
        {!canOperate ? 'Operação Realizada Hoje' : isProcessing ? 'Processando...' : 'Iniciar Lavagem'}
      </Button>

      {!canOperate && (
        <p className="text-xs text-orange-400 mt-2 text-center">
          Apenas uma operação por dia em cada comércio
        </p>
      )}
    </motion.div>
  );
}
