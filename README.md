# TradePulse Micro

A powerful trading journal and AI market analysis app for intraday micro-futures and crypto traders.

## Features

- **Trade Journal**: Log and track all your trades with detailed metrics
- **Dashboard**: View your performance with equity curve and daily P&L charts
- **AI Analyst**: Get real-time market data and AI-powered technical analysis
- **CSV Import**: Easily import trades from TopStepX and NinjaTrader

## Getting Started

### Prerequisites

- Node.js 16+
- Expo CLI
- Supabase account
- API keys for Polygon.io, Finnhub, and OpenAI

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your API keys
4. Start the development server:
   ```
   npm start
   ```

### Supabase Setup

1. Create a new Supabase project
2. Run the SQL in `supabase/schema.sql` to set up the database schema
3. Deploy Edge Functions:
   ```
   supabase functions deploy ai_ta --project-ref your-project-ref
   supabase functions deploy news_ingest --project-ref your-project-ref
   ```

## Building for Production

```
eas build --platform ios
eas build --platform android
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.