import React from 'react';
import { VehicleMetadata as VehicleMetadataType } from '../../types';
import { Car, Info } from 'lucide-react';

interface VehicleMetadataProps {
  vehicle: VehicleMetadataType;
}

const VehicleMetadata: React.FC<VehicleMetadataProps> = ({ vehicle }) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 text-white">
        <div className="flex items-center">
          <Car className="h-5 w-5 mr-2" />
          <h3 className="text-lg font-medium">Vehicle Information</h3>
        </div>
      </div>
      
      <div className="bg-white p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Make</p>
            <p className="font-medium text-gray-900">{vehicle.make}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Model</p>
            <p className="font-medium text-gray-900">{vehicle.model}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Year</p>
            <p className="font-medium text-gray-900">{vehicle.year}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Color</p>
            <p className="font-medium text-gray-900">{vehicle.color}</p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center">
            <Info className="h-4 w-4 text-blue-500 mr-2" />
            <p className="text-sm text-gray-600">
              Vehicle identification confidence: <span className="font-medium">{vehicle.confidence}%</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleMetadata;