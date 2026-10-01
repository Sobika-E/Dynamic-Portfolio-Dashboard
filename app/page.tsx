/**
 * Main Dashboard Page
 *
 * This is the main entry point for the portfolio dashboard.
 * It fetches portfolio data and displays it using the dashboard components.
 */

'use client';

import { useEffect, useState } from 'react';
import { PortfolioData, DashboardState } from '@/types/portfolio';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import PortfolioSummary from '@/components/dashboard/PortfolioSummary';
import SectorSummary from '@/components/dashboard/SectorSummary';
import PortfolioTable from '@/components/dashboard/PortfolioTable';
import AllocationChart from '@/components/dashboard/AllocationChart';
import SectorChart from '@/components/dashboard/SectorChart';

export default function DashboardPage() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    isLoading: true,
    isRefreshing: false,
    lastUpdated: null,
    error: null,
    expandedSectors: new Set<string>(),
  });

  /**
   * Fetch portfolio data from API.
   */
  const fetchPortfolioData = async (isRefresh = false) => {
    if (isRefresh) {
      setDashboardState(prev => ({ ...prev, isRefreshing: true }));
    }

    try {
      const response = await fetch('/api/portfolio/live');
      const result = await response.json();

      if (result.success) {
        setPortfolioData(result.data);
        setDashboardState(prev => ({
          ...prev,
          isLoading: false,
          isRefreshing: false,
          lastUpdated: result.timestamp,
          error: null,
        }));
      } else {
        throw new Error(result.error || 'Failed to fetch portfolio data');
      }
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      setDashboardState(prev => ({
        ...prev,
        isLoading: false,
        isRefreshing: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  };

  /**
   * Initial fetch and set up 15-second refresh interval.
   */
  useEffect(() => {
    // Initial fetch
    fetchPortfolioData();

    // Set up 15-second refresh interval
    const interval = setInterval(() => {
      fetchPortfolioData(true);
    }, 15000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, []);

  /**
   * Toggle sector expansion.
   */
  const toggleSector = (sector: string) => {
    setDashboardState(prev => {
      const newExpanded = new Set(prev.expandedSectors);
      if (newExpanded.has(sector)) {
        newExpanded.delete(sector);
      } else {
        newExpanded.add(sector);
      }
      return { ...prev, expandedSectors: newExpanded };
    });
  };

  /**
   * Manual refresh handler.
   */
  const handleRefresh = () => {
    fetchPortfolioData(true);
  };

  // Loading state
  if (dashboardState.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (dashboardState.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{dashboardState.error}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!portfolioData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 font-medium">No portfolio data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <DashboardHeader
        lastUpdated={dashboardState.lastUpdated}
        isRefreshing={dashboardState.isRefreshing}
        onRefresh={handleRefresh}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Summary */}
        <PortfolioSummary summary={portfolioData.summary} />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <AllocationChart sectors={portfolioData.sectors} />
          <SectorChart sectors={portfolioData.sectors} />
        </div>

        {/* Sector Summary */}
        <SectorSummary
          sectors={portfolioData.sectors}
          expandedSectors={dashboardState.expandedSectors}
          onToggleSector={toggleSector}
        />

        {/* Portfolio Table */}
        <PortfolioTable holdings={portfolioData.holdings} />
      </main>
    </div>
  );
}
