# Dynamic Portfolio Dashboard

An interactive portfolio dashboard built with Next.js, TypeScript, and Tailwind CSS. Displays real-time portfolio holdings with dynamic market data updates.

## Features

- **Real-time Market Data**: Automatically refreshes every 15 seconds
- **Sector Grouping**: Holdings organized by sector with expand/collapse
- **Dynamic Calculations**: Present Value, Gain/Loss, and Portfolio % calculated live
- **Interactive Charts**: Pie chart for allocation, bar chart for sector performance
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Error Handling**: Graceful degradation when external APIs fail
- **Caching**: Reduces external API calls with intelligent caching

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization

### Backend
- **Next.js API Routes** - Server-side API
- **Node.js** - Runtime environment

### Data
- **xlsx** - Excel file parsing
- **yahoo-finance2** - Market and fundamental data (unofficial)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                       │
│  Dashboard Page → Components → API Calls                     │
└─────────────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────────────┐
│              BACKEND API (Next.js API Routes)                │
│  GET /api/portfolio/live → Service Layer → Cache            │
└─────────────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────────────┐
│              EXTERNAL DATA SOURCES                          │
│  Yahoo Finance (CMP, P/E, Earnings)                         │
└─────────────────────────────────────────────────────────────┘
```

## Dataset

The portfolio data is derived from an Excel file containing:
- 29 stocks across 3 sectors (Financial, Tech, Pipe)
- Static data: Purchase Price, Quantity, Sector
- Dynamic data: CMP, P/E, Earnings (fetched from external APIs)

## API Integration

### Yahoo Finance
- **Purpose**: Current Market Price (CMP), P/E Ratio, Latest Earnings
- **Limitation**: No official public API
- **Implementation**: Uses `yahoo-finance2` package (unofficial)
- **Fallback**: Mock data if API fails

### Important Note
Yahoo Finance does not provide an official public API. This implementation uses an unofficial library that may break without notice. For production use, consider a paid API with official support (e.g., Alpha Vantage, Finnhub).

## Caching

The dashboard implements server-side caching to reduce external API calls:

- **Market Data Cache**: 60-second TTL
- **Fundamental Data Cache**: 300-second TTL
- **Strategy**: Check cache first, fetch fresh data only if expired

This means:
- Frontend refreshes every 15 seconds
- Backend may return cached data if still valid
- External APIs called only when cache expires

## Dynamic Updates

The dashboard automatically refreshes every 15 seconds:

1. Frontend calls `/api/portfolio/live`
2. Backend checks cache
3. If cache valid: return cached data
4. If cache expired: fetch fresh data, update cache, return fresh data
5. Frontend updates UI with new data

## Error Handling

The application handles errors gracefully:

- **Partial Failures**: If 1 of 29 stocks fails, return 28 successful + 1 error
- **API Failures**: Fall back to cached data or mock data
- **Missing Data**: Display "N/A" instead of crashing
- **Network Errors**: Show user-friendly error message with retry option

## Project Structure

```
portfolio-dashboard/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main dashboard page
│   ├── globals.css             # Global styles
│   └── api/
│       └── portfolio/
│           └── live/
│               └── route.ts    # API endpoint
├── components/
│   └── dashboard/
│       ├── DashboardHeader.tsx
│       ├── PortfolioSummary.tsx
│       ├── SectorSummary.tsx
│       ├── PortfolioTable.tsx
│       ├── AllocationChart.tsx
│       └── SectorChart.tsx
├── lib/
│   ├── portfolio.ts            # Portfolio data loading
│   ├── market-data.ts          # Market data service
│   ├── fundamentals.ts         # Fundamental data service
│   ├── cache.ts                # Caching layer
│   ├── calculations.ts         # Financial calculations
│   └── symbol-mapping.ts       # Symbol normalization
├── types/
│   └── portfolio.ts            # TypeScript types
├── data/
│   ├── portfolio.json          # Normalized portfolio data
│   └── initialize-portfolio.js  # Excel to JSON converter
└── public/
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd portfolio-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   CACHE_TTL_MARKET=60000
   CACHE_TTL_FUNDAMENTAL=300000
   ```

4. **Initialize portfolio data**
   ```bash
   node data/initialize-portfolio.js
   ```
   (This converts the Excel file to JSON format)

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Building for Production

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CACHE_TTL_MARKET` | Market data cache TTL in milliseconds | 60000 (60s) |
| `CACHE_TTL_FUNDAMENTAL` | Fundamental data cache TTL in milliseconds | 300000 (5min) |

## Known Limitations

1. **Yahoo Finance API**: No official public API; uses unofficial library
2. **Rate Limiting**: External APIs may have rate limits
3. **Market Hours**: Data may not update outside trading hours
4. **Symbol Mapping**: Some symbols may not map correctly to external APIs
5. **Fundamental Data**: May be unavailable for some stocks

## Future Improvements

- [ ] Add WebSocket support for real-time updates
- [ ] Implement user authentication
- [ ] Add portfolio comparison features
- [ ] Support multiple portfolios
- [ ] Add historical performance charts
- [ ] Implement news feed for holdings
- [ ] Add alert system for price targets
- [ ] Support for international markets
- [ ] Add export to PDF/Excel
- [ ] Implement backend database for persistent storage

## Testing

### Manual Testing Checklist

- [ ] Investment calculation correct
- [ ] Present Value calculation correct
- [ ] Gain/Loss calculation correct
- [ ] Portfolio % calculation correct
- [ ] Sector aggregation correct
- [ ] Missing CMP handled gracefully
- [ ] API failure handled gracefully
- [ ] Refresh interval works (15 seconds)
- [ ] Cache behavior correct
- [ ] Responsive design on mobile
- [ ] Expand/collapse sectors works

## Contributing

This is a case-study project. For contributions, please ensure:
- Code follows existing patterns
- TypeScript types are properly defined
- Components are well-documented
- Error handling is implemented

## License

This project is for educational purposes.

## Acknowledgments

- Next.js team for the excellent framework
- Recharts for the charting library
- yahoo-finance2 for market data access
