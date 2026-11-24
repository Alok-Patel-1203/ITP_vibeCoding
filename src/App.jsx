import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import { initRealtimeSubscription } from './services/queueService';

// Page components
import HomePage from './pages/HomePage';
import JoinQueuePage from './pages/JoinQueuePage';
import MyStatusPage from './pages/MyStatusPage';
import ReceptionDashboardPage from './pages/ReceptionDashboardPage';
import BarberViewPage from './pages/BarberViewPage';
import WaitingAreaDisplayPage from './pages/WaitingAreaDisplayPage';
import OwnerSettingsPage from './pages/OwnerSettingsPage';

export default function App() {
  useEffect(() => {
    initRealtimeSubscription();
  }, []);

  return (
    <LanguageProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-charcoal-900 text-gray-100 flex flex-col font-sans">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/join" element={<JoinQueuePage />} />
              <Route path="/status/:id" element={<MyStatusPage />} />
              <Route path="/reception" element={<ReceptionDashboardPage />} />
              <Route path="/barber" element={<Navigate to="/barber/ravi" replace />} />
              <Route path="/barber/:name" element={<BarberViewPage />} />
              <Route path="/display" element={<WaitingAreaDisplayPage />} />
              <Route path="/admin" element={<OwnerSettingsPage />} />
              {/* Fallback redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
}
