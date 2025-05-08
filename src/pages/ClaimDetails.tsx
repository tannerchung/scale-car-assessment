import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useClaims } from '../context/ClaimsContext';
import VehicleMetadata from '../components/results/VehicleMetadata';
import DamageAssessment from '../components/results/DamageAssessment';
import RepairCosts from '../components/results/RepairCosts';
import HistoricalComparison from '../components/results/HistoricalComparison';
import DamageOverlay from '../components/DamageOverlay';

const ClaimDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { claims } = useClaims();
  const claim = claims.find(c => c.id === id);

  if (!claim) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center">Loading claim details...</div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Claim Details</h1>
        <p className="mt-2 text-sm text-gray-500">
          Claim ID: {claim.id}
        </p>
      </div>

      <div className="mb-8 flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/2">
          <div className="relative overflow-hidden rounded-lg border border-gray-200 shadow-sm">
            <img 
              src={claim.imageUrl} 
              alt="Vehicle damage" 
              className="w-full h-auto object-contain bg-gray-50"
            />
            <DamageOverlay
              areas={claim.damage.affectedAreas}
              containerWidth={100}
              containerHeight={100}
            />
          </div>
        </div>
        
        <div className="lg:w-1/2">
          <VehicleMetadata vehicle={claim.vehicle} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <DamageAssessment damage={claim.damage} imageUrl={claim.imageUrl} />
        <RepairCosts repairCost={claim.repairCost} />
      </div>

      <div className="mb-8">
        <HistoricalComparison 
          historicalComparison={claim.historicalComparison} 
          totalCost={claim.repairCost.total}
        />
      </div>
    </main>
  );
};

export default ClaimDetails;