import { useEffect } from 'react'

export function useHotkeys(keys: Record<string, (() => void) | undefined>) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return
      const target = e.target as HTMLElement
      if (target.closest('input, select, textarea')) return
      // Leertaste/Enter auf fokussiertem Knopf löst schon dessen Klick aus
      if ((e.key === ' ' || e.key === 'Enter') && target.closest('button, a')) return
      const run = keys[e.key.toLowerCase()]
      if (!run) return
      e.preventDefault()
      run()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
}
