import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './features/dashboard/Dashboard';
import { LeadDetail } from './features/lead-detail/LeadDetail';
import { IcpSettings } from './features/icp/IcpSettings';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/leads/:id" element={<LeadDetail />} />
        <Route path="/icp" element={<IcpSettings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
