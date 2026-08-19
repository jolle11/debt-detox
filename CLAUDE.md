# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application called "debt-detox" - a financial control app for managing loans and debts. The project uses React 19, TypeScript, and Tailwind CSS v4 with pnpm as the package manager and follows the Next.js App Router architecture.

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
- `pnpm lint` - Run ESLint

## Architecture

- **Framework**: Next.js 15 with App Router (`app/` directory)
- **Database**: PocketBase for backend and data storage
- **File Upload**: UploadThing for handling file and image uploads
- **Styling**: Tailwind CSS v4 with DaisyUI component library
- **Fonts**: Uses Geist and Geist Mono fonts from Google Fonts
- **TypeScript**: Configured with strict mode and path aliases (`@/*` maps to root)

## Key Configuration

- **Path aliases**: `@/*` resolves to project root
- **Tailwind**: Configured with DaisyUI plugin for component styling
- **Dark mode**: Automatic based on system preference
- **Turbopack**: Enabled for faster development builds

## File Structure

- `app/layout.tsx` - Root layout with font configuration
- `app/page.tsx` - Homepage component
- `app/globals.css` - Global styles and theme variables

- I have the server running in another terminal instance, don't ask me to run it.
- For the formatting use tabs that equal 4 spaces.