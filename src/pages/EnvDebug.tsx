import React from 'react';
import EnvDebugger from '../debug/EnvDebugger';

const EnvDebug: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <EnvDebugger />
    </div>
  );
};

export default EnvDebug;