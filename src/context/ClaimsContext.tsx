import React, { createContext, useContext, useState } from 'react';
import { AssessmentResult } from '../types';
import { generateInitialClaims } from '../mockData';

interface ClaimsContextType {
  claims: AssessmentResult[];
  addClaim: (claim: AssessmentResult) => void;
  updateClaim: (id: string, claim: AssessmentResult) => void;
}

const ClaimsContext = createContext<ClaimsContextType | undefined>(undefined);

export const ClaimsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [claims] = useState<AssessmentResult[]>(() => generateInitialClaims(20));

  const addClaim = (claim: AssessmentResult) => {
    claims.push(claim);
  };

  const updateClaim = (id: string, updatedClaim: AssessmentResult) => {
    const index = claims.findIndex(claim => claim.id === id);
    if (index !== -1) {
      claims[index] = updatedClaim;
    }
  };

  return (
    <ClaimsContext.Provider value={{ claims, addClaim, updateClaim }}>
      {children}
    </ClaimsContext.Provider>
  );
};

export const useClaims = () => {
  const context = useContext(ClaimsContext);
  if (context === undefined) {
    throw new Error('useClaims must be used within a ClaimsProvider');
  }
  return context;
};