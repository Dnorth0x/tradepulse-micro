# TradePulse Micro

A comprehensive React Native trading journal app for intraday micro-futures & crypto traders. Built with Expo, TypeScript, and Supabase.

## Features

- 📊 **Trade Journal**: Log and track all your trades with detailed analytics
- 📈 **Real-time Market Data**: Live price feeds via Polygon WebSocket (with Finnhub fallback)
- 🤖 **AI-Powered Analysis**: Technical indicators and market insights using OpenAI
- 📱 **Cross-Platform**: Works on iOS, Android, and Web
- 💾 **CSV Import**: Import trades from TopStepX, NinjaTrader, and custom formats
- 🔐 **Secure**: Authentication and data storage via Supabase
- 💰 **Premium Features**: Stripe integration for subscription management

## Tech Stack

- **Frontend**: React Native + Expo SDK 52
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand + TanStack Query
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **Charts**: React Native Skia
- **Payments**: Stripe
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint + Prettier

## Quick Start

### Prerequisites

- Node.js 18+
- Bun (recommended) or npm/yarn
- Expo CLI
- Supabase account
- API keys (see Environment Setup)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tradepulse-micro
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your actual API keys
```

4. Start the development server:
```bash
bun start
```

### Environment Setup

Create a `.env` file with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# External API Keys
POLYGON_API_KEY=your-polygon-api-key
FINNHUB_API_KEY=your-finnhub-api-key
OPENAI_API_KEY=your-openai-api-key

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key
```

### Database Setup

1. Create a new Supabase project
2. Run the SQL schema from `supabase/schema.sql`
3. Deploy the Edge Functions:

```bash
# Install Supabase CLI first
npm install -g supabase

# Deploy functions
supabase functions deploy ai_ta --project-ref your-project-ref
supabase functions deploy news_ingest --project-ref your-project-ref
```

## Development

### Available Scripts

```bash
# Start development server
bun start

# Start for web
bun start-web

# Run tests
bun test

# Run tests in watch mode
bun test:watch

# Type checking
bun type-check

# Linting
bun lint
bun lint:fix

# Format code
bun format

# Build for production
bun build

# Deploy Edge Functions
bun deploy:functions
```

### Project Structure

```
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Dashboard
│   │   ├── journal.tsx    # Trade journal
│   │   ├── analyst.tsx    # AI analyst
│   │   └── settings.tsx   # Settings
│   ├── new-trade.tsx      # New trade modal
│   ├── import-csv.tsx     # CSV import
│   └── paywall.tsx        # Premium paywall
├── components/            # Reusable components
├── hooks/                 # Custom hooks
├── services/              # API services
├── utils/                 # Utility functions
├── types/                 # TypeScript types
├── constants/             # App constants
├── supabase/              # Database & Edge Functions
└── test/                  # Test files
```

### Testing

Run the test suite:

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test:watch

# Run tests with coverage
bun test:coverage

# Run specific test file
bun test csvParser.test.ts
```

### API Integration

#### Real-time Data

- **Primary**: Polygon WebSocket for real-time market data
- **Fallback**: Finnhub REST API for web and when WebSocket fails
- **Mock Data**: Used when API keys are not configured

#### AI Features

- **Technical Analysis**: OpenAI GPT-3.5 for indicator interpretation
- **Market Digest**: AI-generated summaries of market news
- **Edge Functions**: Serverless functions for AI processing

### Deployment

#### EAS Build

```bash
# Build for development
eas build --profile development

# Build for production
eas build --profile production

# Submit to app stores
eas submit
```

#### Edge Functions

```bash
# Deploy all functions
bun deploy:functions

# Deploy specific function
supabase functions deploy ai_ta --project-ref your-project-ref
```

## Manual Steps

After cloning this repository, you need to manually add these dependencies and scripts to your `package.json`:

### Dependencies to Add

```bash
# Core testing dependencies
bun add -D vitest @vitest/ui jsdom @testing-library/react-native @testing-library/jest-native

# ESLint and Prettier
bun add -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser prettier eslint-config-prettier eslint-plugin-prettier

# Husky for git hooks
bun add -D husky lint-staged

# Additional utilities
bun add -D @types/node
```

### Scripts to Add

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui",
    "type-check": "tsc --noEmit",
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "deploy:functions": "supabase functions deploy --project-ref $SUPABASE_PROJECT_REF",
    "prepare": "husky install"
  }
}
```

### Husky Setup

After installing husky, run:

```bash
# Initialize husky
npx husky install

# Make pre-commit hook executable
chmod +x .husky/pre-commit
```

### Environment Variables

Make sure to set up your environment variables in:

1. `.env` file for local development
2. Expo development build configuration
3. EAS Build secrets for production builds
4. Supabase Edge Function environment variables

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@tradepulse.app or join our Discord community.

---

**Disclaimer**: This application is for educational purposes only and does not constitute financial advice. Trading involves risk and you should consult with a qualified financial advisor before making any trading decisions.