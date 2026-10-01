/**
 * Dashboard Header Component
 *
 * Displays the dashboard title and last updated information.
 */

interface DashboardHeaderProps {
  lastUpdated: string | null;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export default function DashboardHeader({
  lastUpdated,
  isRefreshing,
  onRefresh,
}: DashboardHeaderProps) {
  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Portfolio Dashboard
            </h1>
            <p className="text-sm text-blue-100 mt-1">
              {lastUpdated && `Last updated: ${formatTime(lastUpdated)}`}
            </p>
          </div>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              isRefreshing
                ? 'bg-blue-400 text-white cursor-not-allowed'
                : 'bg-white text-blue-600 hover:bg-blue-50 shadow-md hover:shadow-lg'
            }`}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
          </button>
        </div>
      </div>
    </header>
  );
}
