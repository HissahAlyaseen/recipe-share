import { useEffect, useRef, useState } from 'react'

/**
 * Subscribes a component to storage update custom events and cross-tab storage events,
 * invoking an optional callback and incrementing a revision counter immediately on changes.
 */
export function useStorageSync(events = [], onSync = null) {
  const [revision, setRevision] = useState(0)
  const onSyncRef = useRef(onSync)
  const eventKey = events.join('|')

  useEffect(() => {
    onSyncRef.current = onSync
  }, [onSync])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') {
      return undefined
    }

    const handleSync = () => {
      if (typeof onSyncRef.current === 'function') {
        onSyncRef.current()
      }
      setRevision((prev) => prev + 1)
    }

    const activeEvents = eventKey ? eventKey.split('|') : []
    activeEvents.forEach((evt) => window.addEventListener(evt, handleSync))
    window.addEventListener('storage', handleSync)

    return () => {
      activeEvents.forEach((evt) => window.removeEventListener(evt, handleSync))
      window.removeEventListener('storage', handleSync)
    }
  }, [eventKey])

  return revision
}

