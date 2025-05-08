import React from 'react';
import { useLocation } from 'react-router-dom';
import { ClaimStatus } from '../types';
import Dashboard from './Dashboard';

const Claims: React.FC = () => {
  const location = useLocation();
  const initialStatusFilter = (location.state as { statusFilter?: ClaimStatus })?.statusFilter;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <Dashboard showAllClaims={true} initialStatusFilter={initialStatusFilter} />
    </div>
  );
};

export default Claims;