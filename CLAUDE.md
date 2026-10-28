# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 application called "debt-detox" - a financial control app for managing loans and debts. The project uses React 19, TypeScript, Tailwind CSS v4 + DaisyUI, next-intl, TanStack Query and PocketBase, with pnpm as the package manager and the Next.js App Router architecture.

## App Features

The debt-detox app is designed to help users track and manage their financial commitments:

### Core Tracking

- Record start and end dates for loans/debts
- Track initial amount (if applicable) and final amount
- Mark monthly progress and completion status
- Calculate completion percentage and remaining percentage
- Show total amount and remaining amount

### Enhanced Features

- Add contracting entity information
- Upload product photos
- Record financial details (TIN, TAE, etc.)
- Built-in savings calculator for final amount goals
- Monthly savings tracking with manual amount adjustments
- Flexible payment recording (more or less than scheduled)

## Development Commands

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run Biome (`biome check .`)
- `pnpm test:unit` - Unit and UI tests (Node test runner)
- `pnpm test:pb` - PocketBase integration tests (needs `pnpm pb:up`)
- `pnpm pb:up` / `pb:down` / `pb:logs` - Local PocketBase via Docker Compose

## Architecture

- **Framework**: Next.js 16 with App Router; localized routes live in `app/[locale]/` (next-intl, messages in `messages/*.json`, middleware in `proxy.ts`)
- **Public share links**: `app/share/` (outside the locale routing), rendered as Server Components with data from `lib/shareData.ts`
- **Backend**: PocketBase (`pocketbase/`). All debt/payment writes go through custom routes in `pocketbase/pb_hooks/*.pb.js`; collection API rules block direct writes. Schema changes go in `pocketbase/pb_migrations/`
- **Client data**: `lib/pocketbase.ts` (shared client), TanStack Query hooks in `hooks/`, contexts in `contexts/`
- **Calculations**: `utils/debtCalculations.ts` and `lib/` (dates, sorting, formatting); date logic mirrors `pocketbase/pb_hooks/lib/dates.js`
- **Styling**: Tailwind CSS v4 with DaisyUI
- **Lint/format**: Biome; commits follow Conventional Commits (commitlint + husky)

## Key Configuration

- **Path aliases**: `@/*` resolves to project root
- **Dark mode**: Theme toggle with system preference fallback
- **Turbopack**: Enabled for faster development builds

- I have the server running in another terminal instance, don't ask me to run it.
- For the formatting use tabs that equal 4 spaces.