import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/layout/Navigation';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Claims from './pages/Claims';
import NewClaim from './pages/NewClaim';
import ClaimDetails from './pages/ClaimDetails';
import Settings from './pages/Settings';
import Metrics from './pages/Metrics';
import EnvDebug from './pages/EnvDebug';
import { ClaimsProvider } from './context/ClaimsContext';
import './App.css';

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <ClaimsProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
          <div className="lg:pl-64">
            <Header onMenuClick={() => setMobileMenuOpen(true)} />
            <main className="pt-16">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/claims" element={<Claims />} />
                <Route path="/new-claim" element={<NewClaim />} />
                <Route path="/claims/:id" element={<ClaimDetails />} />
                <Route path="/metrics" element={<Metrics />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/env-debug" element={<EnvDebug />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </ClaimsProvider>
  );
}

export default App;