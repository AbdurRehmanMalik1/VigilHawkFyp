// useGlobalClickListener.ts
import { useEffect } from 'react';
import { useClickStore } from '../zustand/useClickStore';

export function useGlobalClickListener() {
  const { globalClickHandlers } = useClickStore();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      globalClickHandlers.forEach((fn) => fn(e));
    };

    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [globalClickHandlers]);
}
