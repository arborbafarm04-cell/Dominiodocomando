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
    localStorage.removeItem(`container-pos-${id}`);
  }, []);

  const toggleContainer = useCallback((id: string) => {
    setContainers(prev =>
      prev.map(c => c.id === id ? { ...c, isVisible: !c.isVisible } : c)
    );
  }, []);

  const resetPositions = useCallback(() => {
    containers.forEach(c => {
      localStorage.removeItem(`container-pos-${c.id}`);
    });
    window.location.reload();
  }, [containers]);

  return {
    containers,
    removeContainer,
    toggleContainer,
    resetPositions,
  };
}
