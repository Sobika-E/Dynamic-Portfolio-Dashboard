# Setup Instructions

## Environment Variables

Create a `.env.local` file in the project root with the following content:

```env
CACHE_TTL_MARKET=60000
CACHE_TTL_FUNDAMENTAL=300000
```

## Running the Application

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

```bash
npm run build
npm start
```
