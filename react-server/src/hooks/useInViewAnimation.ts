import { useEffect, useRef, useState, type RefObject } from 'react';

type InViewAnimationOptions = {
  animationClass: string;
  initialClass?: string;
  minVisibleTime?: number;
};

export function useOneTimeInViewAnimation<T extends Element>(
  customOptions: InViewAnimationOptions,
  observerOptions: IntersectionObserverInit = { threshold: 0.1 }
): [RefObject<T | null>, string] {
  const {
    animationClass,
    initialClass = 'opacity-0',
    minVisibleTime = 2000,
  } = customOptions;

  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      const node = ref.current;
      if (!node || hasAnimated) return;

      if (entry.isIntersecting) {
        setIsVisible(true);

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          setHasAnimated(true);
          observer.disconnect();
        }, minVisibleTime);
      }
    }, observerOptions);

    const node = ref.current;
    if (node) {
      observer.observe(node);
    }

    return () => {
      observer.disconnect();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [
    minVisibleTime,
    hasAnimated,
    observerOptions.root,
    observerOptions.rootMargin,
    observerOptions.threshold,
  ]);

  const className =
    hasAnimated ? '' : isVisible ? animationClass : initialClass;

  return [ref, className];
}
