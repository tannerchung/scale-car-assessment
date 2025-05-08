import React, { useState } from 'react';
import { AssessmentResult } from '../../../types';
import { DollarSign } from 'lucide-react';

interface CostEstimateReviewProps {
  claim: AssessmentResult;
  onComplete: (data: {
    costReview: {
      verifiedCosts: any[];
      adjustments: any[];
      notes: string;
      totalCost: number;
    }
  }) => void;
}

const CostEstimateReview: React.FC<CostEstimateReviewProps> = ({ claim, onComplete }) => {
  const [costs, setCosts] = useState(claim.repairCost.breakdown.map(item => ({
    ...item,
    verified: false
  })));
  const [totalCost, setTotalCost] = useState(claim.repairCost.total);
  const [notes, setNotes] = useState('');

  const handleCostChange = (index: number, newCost: number) => {
    const updatedCosts = [...costs];
    updatedCosts[index] = {
      ...updatedCosts[index],
      cost: newCost
    };
    setCosts(updatedCosts);
    
    // Update total cost
    const newTotal = updatedCosts.reduce((sum, item) => sum + item.cost, 0);
    setTotalCost(newTotal);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({
      costReview: {
        verifiedCosts: costs.filter(c => c.verified),
        adjustments: costs.map(c => ({
          category: c.category,
          originalCost: claim.repairCost.breakdown.find(b => b.category === c.category)?.cost || 0,
          adjustedCost: c.cost
        })),
        notes,
        totalCost
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Cost Estimate Review</h3>
        <p className="mt-1 text-sm text-gray-500">
          Review and adjust the estimated repair costs for this claim.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Total Estimated Cost
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              value={totalCost}
              onChange={(e) => setTotalCost(Number(e.target.value))}
              className="block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">USD</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cost Breakdown
          </label>
          <div className="space-y-3">
            {costs.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={item.verified}
                  onChange={(e) => {
                    const updatedCosts = [...costs];
                    updatedCosts[index] = {
                      ...item,
                      verified: e.target.checked
                    };
                    setCosts(updatedCosts);
                  }}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.category}</p>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    value={item.cost}
                    onChange={(e) => handleCostChange(index, Number(e.target.value))}
                    className="block w-32 pl-7 pr-12 sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Add any notes about cost adjustments..."
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Continue
        </button>
      </div>
    </form>
  );
};

export default CostEstimateReview;