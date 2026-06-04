import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import Layout from '@/components/layout/Layout'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import ProjectList from '@/pages/projects/ProjectList'
import ProjectForm from '@/pages/projects/ProjectForm'
import ProjectDetail from '@/pages/projects/ProjectDetail'
import ClientList from '@/pages/clients/ClientList'
import ClientForm from '@/pages/clients/ClientForm'
import Calculator from '@/pages/Calculator'
import Parameters from '@/pages/Parameters'
import AdminPanel from '@/pages/admin/AdminPanel'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
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
      </BrowserRouter>
    </AuthProvider>
  )
}
