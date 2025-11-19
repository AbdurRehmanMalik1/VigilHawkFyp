import { useState, useRef, useCallback } from "react";

export function useStateWithRef<T>(
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>, React.RefObject<T>] {
  const [state, setState] = useState<T>(initialValue);
  const ref = useRef<T>(state);

  const setValue = useCallback((value: React.SetStateAction<T>) => {
    setState((prev) => {
      const newValue = value instanceof Function ? value(prev) : value;
      ref.current = newValue;
      return newValue;
    });
  }, []);

  return [state, setValue, ref];
}