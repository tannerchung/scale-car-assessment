import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, ArrowUpDown, ArrowRight, FileText, Clock, Loader2, CheckCircle, XCircle, AlertTriangle, Gauge, Eye, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ClaimStatus, AssessmentResult } from '../types';
import { useClaims } from '../context/ClaimsContext';
import ReviewWizard from '../components/review/ReviewWizard';

interface DashboardProps {
  showAllClaims?: boolean;
  initialStatusFilter?: ClaimStatus;
}

const Dashboard: React.FC<DashboardProps> = ({ showAllClaims = false, initialStatusFilter }) => {
  const navigate = useNavigate();
  const { claims, updateClaim } = useClaims();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'all'>(initialStatusFilter || 'all');
  const [confidenceFilter, setConfidenceFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [reviewFilter, setReviewFilter] = useState<'all' | 'needs_review' | 'auto'>('all');
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
  const [sortField, setSortField] = useState<'date' | 'cost' | 'confidence'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedClaim, setSelectedClaim] = useState<AssessmentResult | null>(null);

  const handleStatusClick = (status: ClaimStatus) => {
    navigate('/claims', { state: { statusFilter: status } });
  };

  const handleReviewComplete = (updatedClaim: AssessmentResult) => {
    updateClaim(updatedClaim.id, updatedClaim);
    setSelectedClaim(null);
  };

  const getStatusColor = (status: ClaimStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
    }
  };

  const getStatusDisplay = (status: ClaimStatus, needsReview: boolean) => {
    if (status === 'pending' && needsReview) {
      return 'Needs Review';
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const needsReviewCount = claims.filter(claim => 
    (claim.status === 'pending' && claim.aiConfidence.needsHumanReview)
  ).length;

  const filteredClaims = claims
    .filter(claim => {
      if (!claim?.vehicle?.make || !claim?.vehicle?.model || !claim?.id) {
        return false;
      }

      const matchesSearch = 
        claim.vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
      
      const matchesConfidence = confidenceFilter === 'all' || claim.aiConfidence.level === confidenceFilter;

      const matchesReview = reviewFilter === 'all' || 
        (reviewFilter === 'needs_review' && claim.aiConfidence.needsHumanReview) ||
        (reviewFilter === 'auto' && !claim.aiConfidence.needsHumanReview);

      const matchesPrice = 
        (!priceRange.min || claim.repairCost.total >= parseInt(priceRange.min)) &&
        (!priceRange.max || claim.repairCost.total <= parseInt(priceRange.max));
      
      return matchesSearch && matchesStatus && matchesConfidence && matchesReview && matchesPrice;
    })
    .sort((a, b) => {
      if (sortField === 'date') {
        return sortDirection === 'asc'
          ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else if (sortField === 'cost') {
        return sortDirection === 'asc'
          ? a.repairCost.total - b.repairCost.total
          : b.repairCost.total - a.repairCost.total;
      } else {
        return sortDirection === 'asc'
          ? a.aiConfidence.score - b.aiConfidence.score
          : b.aiConfidence.score - a.aiConfidence.score;
      }
    });

  const displayedClaims = showAllClaims ? filteredClaims : filteredClaims.slice(0, 5);

  const stats = {
    total: claims.length,
    needsReview: needsReviewCount,
    processing: claims.filter(c => c.status === 'processing').length,
    approved: claims.filter(c => c.status === 'approved').length,
    rejected: claims.filter(c => c.status === 'rejected').length
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">
            {showAllClaims ? 'All Claims' : 'Claims Dashboard'}
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            {showAllClaims 
              ? 'View and manage all vehicle damage claims'
              : 'Overview of recent claims and statistics'
            }
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/new-claim"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Claim
          </Link>
        </div>
      </div>

      {!showAllClaims && (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <div 
            className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleStatusClick('pending')}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-blue-100 rounded-md p-3">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Claims</dt>
                    <dd className="text-lg font-semibold text-gray-900">{stats.total}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div 
            className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              navigate('/claims', { 
                state: { 
                  statusFilter: 'pending',
                  reviewFilter: 'needs_review'
                }
              });
            }}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-amber-100 rounded-md p-3">
                    <AlertTriangle className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Needs Review</dt>
                    <dd className="text-lg font-semibold text-amber-600">{stats.needsReview}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div 
            className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleStatusClick('processing')}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-blue-100 rounded-md p-3">
                    <Loader2 className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Processing</dt>
                    <dd className="text-lg font-semibold text-gray-900">{stats.processing}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div 
            className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleStatusClick('approved')}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-green-100 rounded-md p-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Approved</dt>
                    <dd className="text-lg font-semibold text-gray-900">{stats.approved}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div 
            className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleStatusClick('rejected')}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-red-100 rounded-md p-3">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Rejected</dt>
                    <dd className="text-lg font-semibold text-gray-900">{stats.rejected}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 bg-white shadow-sm rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {showAllClaims && (
            <div className="space-y-6">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by claim ID, vehicle make, or model..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full rounded-lg border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as ClaimStatus | 'all')}
                    className="block w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">AI Confidence</label>
                  <select
                    value={confidenceFilter}
                    onChange={(e) => setConfidenceFilter(e.target.value as 'all' | 'high' | 'medium' | 'low')}
                    className="block w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="all">All Levels</option>
                    <option value="high">High (85%+)</option>
                    <option value="medium">Medium (70-85%)</option>
                    <option value="low">Low (&lt;70%)</option>
                  </select>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Review Type</label>
                  <select
                    value={reviewFilter}
                    onChange={(e) => setReviewFilter(e.target.value as 'all' | 'needs_review' | 'auto')}
                    className="block w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="needs_review">Needs Review</option>
                    <option value="auto">Auto-Approved</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                        className="block w-full rounded-lg border-gray-300 pl-7 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                    <span className="text-gray-500">-</span>
                    <div className="relative flex-1">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                        className="block w-full rounded-lg border-gray-300 pl-7 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    if (sortField === 'date') {
                      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('date');
                      setSortDirection('desc');
                    }
                  }}
                  className={`inline-flex items-center px-3 py-2 border rounded-lg text-sm font-medium ${
                    sortField === 'date'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Date
                  {sortField === 'date' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
                <button
                  onClick={() => {
                    if (sortField === 'cost') {
                      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('cost');
                      setSortDirection('desc');
                    }
                  }}
                  className={`inline-flex items-center px-3 py-2 border rounded-lg text-sm font-medium ${
                    sortField === 'cost'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Cost
                  {sortField === 'cost' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
                <button
                  onClick={() => {
                    if (sortField === 'confidence') {
                      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('confidence');
                      setSortDirection('desc');
                    }
                  }}
                  className={`inline-flex items-center px-3 py-2 border rounded-lg text-sm font-medium ${
                    sortField === 'confidence'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  <Gauge className="h-4 w-4 mr-2" />
                  AI Score
                  {sortField === 'confidence' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Claim ID
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    AI Confidence
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estimate
                  </th>
                  <th scope="col" className="relative px-3 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedClaims.map((claim) => (
                  <tr key={claim.id} className={`hover:bg-gray-50 ${
                    claim.aiConfidence.needsHumanReview ? 'bg-amber-50' : ''
                  }`}>
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        {claim.aiConfidence.needsHumanReview && (
                          <div className="group relative">
                            <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                            <div className="hidden group-hover:block absolute left-0 top-6 w-48 bg-white p-2 rounded shadow-lg border border-gray-200 text-xs text-gray-600 z-10">
                              {claim.aiConfidence.escalationReason && (
                                <>Reason: {claim.aiConfidence.escalationReason}</>
                              )}
                            </div>
                          </div>
                        )}
                        {claim.id}
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                      {claim.vehicle?.year} {claim.vehicle?.make} {claim.vehicle?.model}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(claim.timestamp), 'MMM d, yyyy')}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                        {getStatusDisplay(claim.status, claim.aiConfidence.needsHumanReview)}
                      </span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`h-2.5 w-2.5 rounded-full mr-2 ${
                          claim.aiConfidence.level === 'high' 
                            ? 'bg-green-500' 
                            : claim.aiConfidence.level === 'medium'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`} />
                        <span className={`text-sm ${
                          claim.aiConfidence.level === 'high'
                            ? 'text-green-700'
                            : claim.aiConfidence.level === 'medium'
                              ? 'text-yellow-700'
                              : 'text-red-700'
                        }`}>
                          {claim.aiConfidence.score}%
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${claim.repairCost.total.toLocaleString()}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {claim.status === 'pending' && claim.aiConfidence.needsHumanReview && (
                          <button
                            onClick={() => setSelectedClaim(claim)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                          >
                            Review
                          </button>
                        )}
                        <Link
                          to={`/claims/${claim.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!showAllClaims && displayedClaims.length > 0 && (
            <div className="mt-6 text-center">
              <Link
                to="/claims"
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View all claims
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {selectedClaim && (
        <ReviewWizard
          claim={selectedClaim}
          onClose={() => setSelectedClaim(null)}
          onComplete={handleReviewComplete}
        />
      )}
    </main>
  );
};

export default Dashboard;