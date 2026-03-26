import { useEffect, useState } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { getPlayerLot } from '@/services/playerLotService';

export function usePlayerLot() {
  const player = usePlayerStore((state) => state.player);
  const [lot, setLot] = useState<any>(null);

  useEffect(() => {
    const loadLot = async () => {
      if (!player?._id) return;

      const playerLot = await getPlayerLot(player._id);
      setLot(playerLot);
    };

    loadLot();
  }, [player?._id]);

  return lot;
}