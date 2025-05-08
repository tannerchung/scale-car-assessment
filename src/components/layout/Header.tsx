import React, { useState } from 'react';
import { Bell, Search, User, Menu, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { generateMockResult } from '../../mockData';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState(() => {
    // Generate some claims that need review
    const reviewClaims = Array.from({ length: 3 }, () => {
      const claim = generateMockResult();
      claim.aiConfidence.level = 'low';
      claim.aiConfidence.score = Math.floor(Math.random() * 30) + 40; // 40-70%
      claim.aiConfidence.needsHumanReview = true;
      return claim;
    });

    // Generate two more claims for info notifications
    const newClaim = generateMockResult();
    const completedClaim = generateMockResult();

    return [
      ...reviewClaims.map(claim => ({
        id: claim.id,
        type: 'review' as const,
        message: `Claim #${claim.id.slice(0, 4)} needs human review - Low confidence (${claim.aiConfidence.score}%)`,
        time: '5m ago',
        claimId: claim.id,
        confidence: claim.aiConfidence.score
      })),
      { 
        id: 'n1', 
        type: 'info' as const, 
        message: `New claim #${newClaim.id.slice(0, 4)} has been submitted`, 
        time: '1h ago', 
        claimId: newClaim.id 
      },
      { 
        id: 'n2', 
        type: 'info' as const, 
        message: `Assessment completed for claim #${completedClaim.id.slice(0, 4)}`, 
        time: '2h ago', 
        claimId: completedClaim.id 
      },
    ];
  });

  const unreadCount = notifications.filter(n => n.type === 'review').length;

  const handleNotificationClick = (claimId: string) => {
    setShowNotifications(false);
    navigate(`/claims/${claimId}`);
  };

  return (
    <header className="bg-white shadow-sm fixed top-0 right-0 left-0 lg:left-64 z-10">
      <div className="px-4 py-4 flex items-center justify-between">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex-1 max-w-xl mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search claims..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
            >
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
              <Bell className="h-6 w-6" />
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                  <div className="mt-2 space-y-2">
                    {notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification.claimId)}
                        className={`w-full text-left flex items-start p-3 ${
                          notification.type === 'review' 
                            ? 'bg-amber-50 hover:bg-amber-100' 
                            : 'hover:bg-gray-50'
                        } rounded-md transition-colors duration-150`}
                      >
                        {notification.type === 'review' ? (
                          <div className="flex items-start w-full">
                            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm text-amber-800 font-medium">{notification.message}</p>
                              <p className="text-xs text-amber-600 mt-1">Click to review claim</p>
                              <div className="mt-2 flex items-center">
                                <div className="flex-1 bg-amber-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-amber-500 h-1.5 rounded-full" 
                                    style={{ width: `${notification.confidence}%` }}
                                  />
                                </div>
                                <span className="ml-2 text-xs text-amber-700">
                                  {notification.confidence}% confidence
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="ml-3">
                            <p className="text-sm text-gray-700">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            <button className="flex items-center space-x-3 p-2 rounded-full hover:bg-gray-100">
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-500" />
              </div>
              <span className="hidden sm:inline-block text-sm font-medium text-gray-700">John Smith</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;