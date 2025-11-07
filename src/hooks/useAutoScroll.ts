import { useEffect, RefObject } from 'react'

/**
 * Custom hook for auto-scrolling to bottom of a container
 * @param ref - Ref to the scrollable element
 * @param dependencies - Dependencies that should trigger scroll (e.g., message count, loading state)
 */
export function useAutoScroll(
  ref: RefObject<HTMLDivElement>,
  dependencies: any[]
) {
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)
}
