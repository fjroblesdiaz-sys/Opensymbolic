# OpenSymbolic OS2 Experimentation Environment

## Overview

This is an interactive laboratory application for experimenting with "conceptrons" - abstract data entities defined by color, shape, tone, and metadata. The application provides a split-panel interface where users can create, edit, and visualize conceptrons, chain them together into sequences, and save experiments for later use. The interface is inspired by audio production tools and scientific visualization software, combining functional controls with reactive artistic canvas displays.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, using Vite as the build tool and development server.

**UI Component Library**: Radix UI primitives with shadcn/ui styling system, utilizing Tailwind CSS for styling with a custom design system defined in the New York style variant.

**State Management**: 
- Local component state using React hooks (useState, useCallback, useEffect)
- TanStack Query (React Query) for server state management and caching
- No global state management library - state is localized to components

**Routing**: Wouter for lightweight client-side routing (currently single-page with Laboratory route)

**Design System**:
- Split-panel layout: Left panel (35%) for controls, right panel (65%) for canvas visualization
- Bottom collapsible dock for saved experiments and chain sequencer
- Typography: Inter for UI/controls, JetBrains Mono for data/values
- Responsive: Side-by-side on desktop, stacked vertical on mobile with collapsible drawer
- Custom spacing system using Tailwind units (2, 3, 4, 6, 8)

**Key Features**:
- Conceptron editor with color picker, shape selector, tone slider, and metadata input
- Real-time HTML5 Canvas visualization with particle effects
- Web Audio API integration for playing tones based on conceptron frequency
- Chain sequencer for creating sequences of conceptrons
- Experiment library for saving/loading complete sessions

### Backend Architecture

**Framework**: Express.js server with TypeScript

**API Design**: RESTful API endpoints following resource-based patterns:
- `GET /api/experiments` - Retrieve all experiments
- `GET /api/experiments/:id` - Retrieve specific experiment
- `POST /api/experiments` - Create new experiment
- `DELETE /api/experiments/:id` - Delete experiment

**Middleware Stack**:
- JSON body parsing with raw body preservation for webhook support
- URL-encoded form data parsing
- Request logging with duration tracking and response capture
- Vite development middleware integration in development mode

**Data Validation**: 
- Zod schemas for runtime type validation
- Shared schema definitions between client and server
- drizzle-zod integration for database schema validation

**Development Strategy**:
- Hot Module Replacement (HMR) via Vite in development
- Production build uses esbuild for server bundling
- Custom error overlay plugin for development

### Data Storage

**ORM**: Drizzle ORM with PostgreSQL dialect configuration

**Database Schema**:
- `experiments` table: Stores experiment sessions with conceptron and chain data
  - Fields: id (UUID), name, description, conceptrons (JSONB array), chains (JSONB array), tags (text array), createdAt (timestamp)
- `users` table: User authentication data (currently minimal implementation)
  - Fields: id (UUID), username (unique), password

**Storage Strategy**: 
- Current implementation uses in-memory storage (`MemStorage` class) for development
- Production-ready PostgreSQL schema defined via Drizzle
- JSONB columns for flexible storage of conceptron and chain data structures

**Data Models**:
- Conceptron: { id, color (hex), shape (enum), tone (20-20000 Hz), metadata (optional object) }
- ConceptronChain: { id, conceptrons (array of IDs), name (optional) }
- Experiment: Combines multiple conceptrons and chains with metadata

### External Dependencies

**Database**: 
- Neon Database serverless PostgreSQL (via `@neondatabase/serverless`)
- Drizzle ORM for type-safe database queries
- Database URL configured via environment variable `DATABASE_URL`

**UI Framework Dependencies**:
- Radix UI: Comprehensive set of unstyled, accessible component primitives
- shadcn/ui: Component collection built on Radix UI with Tailwind styling
- Tailwind CSS: Utility-first CSS framework with custom configuration

**Development Tools**:
- Replit-specific plugins: cartographer, dev-banner, runtime-error-modal
- TypeScript for type safety across client, server, and shared code
- ESBuild for production server bundling
- Vite for frontend build and development server

**Audio Processing**: Web Audio API (browser native, no external library)

**Canvas Rendering**: HTML5 Canvas API (browser native, no external library)

**Form Handling**: 
- React Hook Form with Zod resolvers for validation
- Date manipulation via date-fns

**Utilities**:
- nanoid: ID generation
- clsx & tailwind-merge: Conditional className utilities
- class-variance-authority: Type-safe variant styling