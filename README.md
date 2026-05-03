# SmartQuote

SmartQuote is a React broker portal for creating and reviewing insurance quotes. It supports car, house, and health insurance quote flows, calculates mock premiums, tracks quote history, and protects the main app behind a demo login.

## Features

- Demo broker authentication with protected routes
- Dashboard with quote statistics, recent quotes, and quick quote actions
- New quote flow for car, house, and health insurance
- Form validation with React Hook Form and Zod
- Mock quote engine for premiums, coverage limits, deductibles, and risk rejection
- Quote history with search, type filters, status filters, and pagination
- Quote detail pages with client, policy, and premium breakdown information
- Playwright end-to-end tests for core user workflows

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- TanStack Query
- Zustand
- React Hook Form
- Zod
- Tailwind CSS
- Playwright

## Getting Started

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Open the app at:

```text
http://localhost:5173
```

## Demo Login

The app uses mock client-side authentication for local development.

```text
Email: broker@demo.com
Password: any value
```

The auth state is stored in browser `localStorage` through Zustand's `persist` middleware using the key `smartquote-auth`.

## Available Scripts

```bash
npm run dev
```

Starts the Vite development server.

```bash
npm run build
```

Runs TypeScript project checks with `tsc -b`, then creates a production bundle with `vite build`.

```bash
npm run preview
```

Serves the production build locally for preview.

```bash
npm run lint
```

Runs ESLint across the project.

```bash
npm test
```

Runs the Playwright end-to-end test suite.

```bash
npm run test:ui
```

Opens the Playwright interactive test runner.

```bash
npm run test:report
```

Opens the latest Playwright HTML report.

```bash
npm run db:start
```

Starts the local PostgreSQL container.

```bash
npm run db:stop
```

Stops the local PostgreSQL container.

```bash
npm run db:reset
```

Removes the local PostgreSQL volume and starts a fresh database.

## Testing Notes

The tests in `tests/` are Playwright end-to-end tests. They start the real Vite dev server and drive the app in Chromium and Firefox.

Useful commands:

```bash
npx playwright test --headed
npx playwright test --headed --workers=1 --slow-mo=500
npx playwright test --debug
```

If browsers are missing, install them with:

```bash
npx playwright install
```

## Project Structure

```text
src/
  components/
    insurance/       Quote form sections
    layout/          Header, layout, and protected route guard
    quotes/          Quote result display
    ui/              Shared UI primitives
  hooks/             TanStack Query hooks
  pages/             Route-level pages
  services/          Mock API, mock data, and quote calculation engine
  store/             Zustand auth store
  types/             Shared TypeScript types and validation schemas
  utils/             Shared constants
tests/               Playwright end-to-end tests
```

## Routing

Routes are defined in `src/App.tsx`.

- `/login` - sign in page
- `/` - dashboard
- `/quotes/new` - create a new quote
- `/quotes` - quote history
- `/quotes/:id` - quote detail page

Protected app routes are wrapped by `ProtectedRoute`, which redirects unauthenticated users to `/login`.

## Data Model

This is currently a frontend-only demo app. Quote data comes from `src/services/mockData.ts`, and new quotes are stored in an in-memory array inside `src/services/api.ts` while the app session is running.

Premium calculations live in `src/services/quoteEngine.ts`.

## Database Recommendation

For a production version, PostgreSQL is the recommended primary database. SmartQuote data is structured and relational: brokers create quotes for clients, each quote has a status, type, condition details, calculated result, and timestamps.

This application is expected to be more read-heavy than write-heavy. Brokers will frequently review dashboards, search quote history, filter by status or type, and open quote details. Writes happen when quotes are created or updated, but read performance and reliable filtering are more important early priorities.

Recommended starting tables:

- `brokers`
- `clients`
- `quotes`
- `quote_results`
- `car_quote_conditions`
- `house_quote_conditions`
- `health_quote_conditions`

Recommended indexes:

- `quotes.broker_id`
- `quotes.status`
- `quotes.type`
- `quotes.created_at`
- `quotes.reference_number`
- `clients.email`
- client name fields used for search

For an MVP, quote condition fields can also be stored as `jsonb` on the `quotes` table instead of immediately splitting each insurance type into separate condition tables. That keeps the schema flexible while the product is still changing.

## Local PostgreSQL

This repo includes a Docker Compose setup for a real local PostgreSQL database.

Create a local environment file:

```bash
cp .env.example .env
```

Start PostgreSQL:

```bash
npm run db:start
```

The database will be available at:

```text
postgresql://smartquote:smartquote_dev_password@localhost:5432/smartquote
```

The schema is initialized from `db/init/001_schema.sql` the first time the database volume is created.

Stop PostgreSQL:

```bash
npm run db:stop
```

Remove the local database volume and start fresh:

```bash
npm run db:reset
```
