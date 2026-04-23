import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthPage } from '@/components/AuthPage'
import { AuthedLayout } from '@/components/AuthedLayout'
import { WorkspaceLayout } from '@/components/WorkspaceLayout'
import { BatchPage } from '@/components/BatchPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route element={<AuthedLayout />}>
          <Route path="/" element={<WorkspaceLayout />} />
          <Route path="/batch" element={<BatchPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
