import React from 'react';
import { DamageAssessment as DamageAssessmentType } from '../../types';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import DamageOverlay from '../DamageOverlay';

interface DamageAssessmentProps {
  damage: DamageAssessmentType;
  imageUrl: string;
}

const DamageAssessment: React.FC<DamageAssessmentProps> = ({ damage, imageUrl }) => {
  // Determine severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Minor':
        return 'text-green-600';
      case 'Moderate':
        return 'text-yellow-600';
      case 'Severe':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSeverityBgColor = (severity: string) => {
    switch (severity) {
      case 'Minor':
        return 'bg-green-100';
      case 'Moderate':
        return 'bg-yellow-100';
      case 'Severe':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Minor':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'Moderate':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'Severe':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  // Check for low confidence areas
  const hasLowConfidenceAreas = damage.affectedAreas.some(area => area.confidence < 75);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm h-full">
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-3 text-white">
        <h3 className="text-lg font-medium">Damage Assessment</h3>
      </div>
      
      <div className="bg-white p-4 h-full flex flex-col">
        <div className="flex items-center mb-4">
          <div className={`rounded-full ${getSeverityBgColor(damage.severity)} p-2 mr-3`}>
            {getSeverityIcon(damage.severity)}
          </div>
          <div>
            <p className="text-sm text-gray-500">Severity</p>
            <p className={`font-medium ${getSeverityColor(damage.severity)}`}>
              {damage.severity}
            </p>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-500">Description</p>
          <p className="text-gray-900">{damage.description}</p>
        </div>
        
        <div className="mb-4 flex-1">
          <p className="text-sm text-gray-500 mb-2">Affected Areas</p>
          <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
            <img
              src={imageUrl}
              alt="Vehicle damage"
              className="w-full h-full object-cover"
            />
            <DamageOverlay
              areas={damage.affectedAreas}
              containerWidth={100}
              containerHeight={100}
            />
          </div>
          {hasLowConfidenceAreas && (
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Image Quality Warning
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    Some damage areas have low detection confidence. Additional photos may be required.
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="space-y-2">
            {damage.affectedAreas.map((area, index) => (
              <div 
                key={index} 
                className={`bg-gray-50 border rounded p-2 flex justify-between items-center ${
                  area.confidence < 75 ? 'border-amber-300' : 'border-gray-200'
                }`}
              >
                <span className="text-gray-900">{area.name}</span>
                <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                  area.confidence < 75 
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {area.confidence}% confidence
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-auto pt-3 border-t border-gray-200">
          <div className="flex items-center">
            <Info className="h-4 w-4 text-blue-500 mr-2" />
            <p className="text-sm text-gray-600">
              Assessment confidence: <span className="font-medium">{damage.confidence}%</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DamageAssessment;