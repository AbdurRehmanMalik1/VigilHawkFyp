// clickStore.ts
import { create } from 'zustand';

type ClickHandler = (event: MouseEvent) => void;

interface ClickStore {
  globalClickHandlers: Set<ClickHandler>;
  addGlobalClickHandler: (fn: ClickHandler | ClickHandler[]) => void;
  removeGlobalClickHandler: (fn: ClickHandler | ClickHandler[]) => void;
}

export const useClickStore = create<ClickStore>((set) => ({
  globalClickHandlers: new Set(),

  addGlobalClickHandler: (fnOrFns) =>
    set((state) => {
      const fns = Array.isArray(fnOrFns) ? fnOrFns : [fnOrFns];
      fns.forEach(fn => state.globalClickHandlers.add(fn));
      return { globalClickHandlers: new Set(state.globalClickHandlers) };
    }),

  removeGlobalClickHandler: (fnOrFns) =>
    set((state) => {
      const fns = Array.isArray(fnOrFns) ? fnOrFns : [fnOrFns];
      fns.forEach(fn => state.globalClickHandlers.delete(fn));
      return { globalClickHandlers: new Set(state.globalClickHandlers) };
    }),
}));

