import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useBatchJobsSync } from '@/hooks/useBatchJobs'
import { QueueDrawer } from '@/components/QueueDrawer'

/**
 * Wraps all authenticated routes. Renders once per session (not per route),
 * which is where we mount singletons like the batch-runner sync hook and the
 * global queue drawer.
 */
export function AuthedLayout() {
  const { user, loading } = useAuth()

  // Singleton: loads batch jobs, subscribes to realtime, starts the runner.
  useBatchJobsSync()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return (
    <>
      <Outlet />
      <QueueDrawer />
    </>
  )
}
