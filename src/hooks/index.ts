// ============================================
// EduNex AI Tutor - Custom Hooks
// ============================================

export { useChatStore } from "@/store/chat-store";
export { useUserStore } from "@/store/user-store";

import { useCallback, useEffect, useRef } from "react";

/**
 * Hook to debounce a value change.
 * Useful for search inputs and other frequently-changing values.
 */
export function useDebounce<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedFn;
}

/**
 * Hook to auto-scroll an element to bottom when content changes.
 */
export function useAutoScroll<T extends HTMLElement>(
  deps: unknown[]
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
