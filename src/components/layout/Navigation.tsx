import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, X, Settings, BarChart3 } from 'lucide-react';

interface NavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <nav className={`
        bg-white border-r border-gray-200 w-64 min-h-screen fixed left-0 top-0 z-30
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">AutoClaim AI</h2>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          <ul className="space-y-2">
            <li>
              <NavLink
                to="/"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <LayoutDashboard className="h-5 w-5 mr-3" />
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/claims"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <FileText className="h-5 w-5 mr-3" />
                Claims
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/metrics"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <BarChart3 className="h-5 w-5 mr-3" />
                Metrics
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/settings"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <Settings className="h-5 w-5 mr-3" />
                Settings
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Navigation;