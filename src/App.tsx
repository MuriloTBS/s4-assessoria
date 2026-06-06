import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import Layout from '@/components/layout/Layout'
import ProtectedRoute from '@/components/layout/ProtectedRoute'

const Login = lazy(() => import('@/pages/Login'))
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'))
const ResetPassword = lazy(() => import('@/pages/ResetPassword'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const ProjectList = lazy(() => import('@/pages/projects/ProjectList'))
const ProjectForm = lazy(() => import('@/pages/projects/ProjectForm'))
const ProjectDetail = lazy(() => import('@/pages/projects/ProjectDetail'))
const ClientList = lazy(() => import('@/pages/clients/ClientList'))
const ClientForm = lazy(() => import('@/pages/clients/ClientForm'))
const Calculator = lazy(() => import('@/pages/Calculator'))
const Parameters = lazy(() => import('@/pages/Parameters'))
const AdminPanel = lazy(() => import('@/pages/admin/AdminPanel'))

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/projects" element={<ProjectList />} />
                <Route path="/projects/new" element={<ProjectForm />} />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                <Route path="/projects/:id/edit" element={<ProjectForm />} />
                <Route path="/clients" element={<ClientList />} />
                <Route path="/clients/new" element={<ClientForm />} />
                <Route path="/clients/:id/edit" element={<ClientForm />} />
                <Route path="/calculator" element={<Calculator />} />
                <Route path="/parameters" element={<Parameters />} />
                <Route path="/admin" element={<AdminPanel />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}
