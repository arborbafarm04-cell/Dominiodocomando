import { useState, useCallback } from 'react';

export interface ContainerState {
  id: string;
  title: string;
  isVisible: boolean;
}

export function useDraggableContainers(initialContainers: ContainerState[]) {
  const [containers, setContainers] = useState<ContainerState[]>(initialContainers);

  const removeContainer = useCallback((id: string) => {
    setContainers(prev => prev.filter(c => c.id !== id));
  }, []);

  const toggleContainer = useCallback((id: string) => {
    setContainers(prev =>
      prev.map(c => c.id === id ? { ...c, isVisible: !c.isVisible } : c)
    );
  }, []);

  const resetPositions = useCallback(() => {
    window.location.reload();
  }, []);

  return {
    containers,
    removeContainer,
    toggleContainer,
    resetPositions,
  };
}
