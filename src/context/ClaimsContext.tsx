import React, { createContext, useContext, useState } from 'react';
import { AssessmentResult } from '../types';
import { generateInitialClaims } from '../mockData';

interface ClaimsContextType {
  claims: AssessmentResult[];
  addClaim: (claim: AssessmentResult) => void;
  updateClaim: (id: string, updatedClaim: AssessmentResult) => void;
}

const ClaimsContext = createContext<ClaimsContextType | undefined>(undefined);

export const ClaimsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [claims, setClaims] = useState<AssessmentResult[]>(() => generateInitialClaims(20));

  const addClaim = (claim: AssessmentResult) => {
    setClaims(prevClaims => [...prevClaims, claim]);
  };

  const updateClaim = (id: string, updatedClaim: AssessmentResult) => {
    setClaims(prevClaims => {
      const index = prevClaims.findIndex(claim => claim.id === id);
      if (index === -1) return prevClaims;
      
      const newClaims = [...prevClaims];
      newClaims[index] = updatedClaim;
      return newClaims;
    });
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

export default ClaimsProvider;