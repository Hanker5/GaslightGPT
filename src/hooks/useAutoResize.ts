import { useEffect, RefObject } from 'react'

/**
 * Custom hook for auto-resizing textareas based on content
 * @param ref - Ref to the textarea element
 * @param value - Current value of the textarea (triggers resize on change)
 */
export function useAutoResize(
  ref: RefObject<HTMLTextAreaElement>,
  value: string
) {
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = ref.current.scrollHeight + 'px'
    }
  }, [ref, value])
}
