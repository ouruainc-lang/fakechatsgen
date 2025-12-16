import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SubscriptionProvider } from './context/SubscriptionContext';
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';

function App() {
  return (
    <SubscriptionProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/pricing" element={<PricingPage />} />
        </Routes>
      </Router>
    </SubscriptionProvider>
  );
}

export default App;
