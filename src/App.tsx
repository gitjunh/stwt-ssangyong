import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useMobileLayout } from './hooks/useMobileLayout'
import AdminLogin from './pages/AdminLogin'
import ApplicationComplete from './pages/ApplicationComplete'
import ApplicationLookup from './pages/ApplicationLookup'
import AccessLogsPage from './pages/manager/AccessLogsPage'
import CommunityPage from './pages/manager/CommunityPage'
import OfficeHome from './pages/manager/OfficeHome'
import ResidentsPage from './pages/manager/ResidentsPage'
import PrivacyConsent from './pages/PrivacyConsent'
import ResidentLogin from './pages/resident/ResidentLogin'
import ResidentPortal from './pages/resident/ResidentPortal'
import SafetyPledge from './pages/SafetyPledge'
import VisitApproval from './pages/VisitApproval'
import VisitInfo from './pages/VisitInfo'
import VisitMain from './pages/VisitMain'
import VisitorInfo from './pages/VisitorInfo'

const BRAND_TITLE = '쌍용 만현마을 방문출입'
const BRAND_DESCRIPTION = '쌍용 만현마을 · STWORLD 스마트 방문출입'

export default function App() {
  useMobileLayout()

  useEffect(() => {
    document.title = BRAND_TITLE
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', BRAND_DESCRIPTION)
  }, [])

  return (
    <Routes>
      <Route path="/" element={<VisitMain />} />
      <Route path="/lookup" element={<ApplicationLookup />} />
      <Route path="/apply/privacy" element={<PrivacyConsent />} />
      <Route path="/apply/safety" element={<SafetyPledge />} />
      <Route path="/apply/visit-info" element={<VisitInfo />} />
      <Route path="/apply/visitor-info" element={<VisitorInfo />} />
      <Route path="/apply/complete" element={<ApplicationComplete />} />
      <Route path="/resident/login" element={<ResidentLogin />} />
      <Route path="/resident" element={<ResidentPortal />} />
      <Route path="/manager/login" element={<AdminLogin />} />
      <Route path="/manager" element={<OfficeHome />} />
      <Route path="/manager/residents" element={<ResidentsPage />} />
      <Route path="/manager/approvals" element={<VisitApproval />} />
      <Route path="/manager/community" element={<CommunityPage />} />
      <Route path="/manager/access-logs" element={<AccessLogsPage />} />
      <Route path="/manager/*" element={<Navigate to="/manager" replace />} />
    </Routes>
  )
}
