import { useEffect, useState } from 'react';
import { useSpinVaultStore } from '@/store/spinVaultStore';
import { usePlayerStore } from '@/store/playerStore';

export const useSpinVault = () => {
  const { spins, addSpins, deductSpins, initializeVault, getTimeUntilNextGain, barracoLevel: vaultBarracoLevel, setBarracoLevel } = useSpinVaultStore();
  const { barracoLevel } = usePlayerStore();
  const [timeUntilNextGain, setTimeUntilNextGain] = useState(0);
  const [lastGainAmount, setLastGainAmount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);

  // Initialize vault on first login
  useEffect(() => {
    initializeVault(barracoLevel);
  }, [initializeVault, barracoLevel]);

  // Update barraco level in vault store when it changes
  useEffect(() => {
    if (barracoLevel && barracoLevel > 0) {
      setBarracoLevel(barracoLevel);
    }
  }, [barracoLevel, setBarracoLevel]);

  // Handle spin gain every 60 seconds - uses the barraco level from vault store
  useEffect(() => {
    const interval = setInterval(() => {
      const gainAmount = Math.max(1, vaultBarracoLevel);
      addSpins(gainAmount);
      setLastGainAmount(gainAmount);
      setShowNotification(true);

      // Hide notification after 2 seconds
      const timeoutId = setTimeout(() => {
        setShowNotification(false);
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }, 60000);

    return () => clearInterval(interval);
  }, [vaultBarracoLevel, addSpins]);

  // Update countdown timer - FIXED: Removed getTimeUntilNextGain from deps to prevent infinite loops
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUntilNextGain(getTimeUntilNextGain());
    }, 1000); // Changed from 100ms to 1000ms to reduce CPU usage

    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  return {
    spins,
    barracoLevel: vaultBarracoLevel,
    timeUntilNextGain,
    formatTime,
    deductSpins,
    lastGainAmount,
    showNotification,
  };
};
