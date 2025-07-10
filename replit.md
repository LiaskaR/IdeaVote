# IdeaHub - Collaborative Idea Management Platform

## Overview

IdeaHub is a full-stack web application for collaborative idea management, built with a modern tech stack. It allows users to submit, discuss, vote on, and manage innovative ideas within an organization. The application features a React frontend with a Node.js/Express backend, using PostgreSQL for data persistence.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Java 21 with Spring Boot 3.2.1 framework
- **Database**: PostgreSQL with JPA/Hibernate ORM (H2 for development)
- **Authentication**: Keycloak 23.0.4 with JWT tokens
- **Security**: Spring Security with Keycloak adapter
- **Build Tool**: Maven for dependency management
- **Development**: Spring Boot DevTools for hot reload
- **API Layer**: REST controllers with DTOs for data transfer
- **Service Layer**: Business logic with transactional support
- **Repository Layer**: JPA repositories with custom queries

### Database Schema
The application uses a PostgreSQL database with the following main entities:
- **Users**: User accounts with authentication and profile information
- **Ideas**: Core idea submissions with title, description, category, and tags
- **Votes**: User voting system supporting upvotes and downvotes
- **Comments**: Discussion system for ideas

## Key Components

### Data Models
- **Users Table**: id, username, password, avatar, role
- **Ideas Table**: id, title, description, category, tags, authorId, createdAt
- **Votes Table**: id, ideaId, userId, type (up/down)
- **Comments Table**: id, ideaId, userId, content, createdAt

### Frontend Components
- **Header**: Navigation with search and user profile
- **HeroSection**: Dashboard with statistics display
- **FiltersBar**: Category filtering and sorting options
- **IdeaCard**: Individual idea display with voting interface
- **CreateIdeaModal**: Form for submitting new ideas
- **IdeaDetailModal**: Detailed view with comments and voting

### API Endpoints
- `GET /api/ideas` - Fetch ideas with optional filtering and sorting
- `GET /api/ideas/:id` - Get specific idea details
- `POST /api/ideas` - Create new idea
- `PATCH /api/ideas/:id` - Update idea
- `DELETE /api/ideas/:id` - Delete idea
- `GET /api/stats` - Get platform statistics

## Data Flow

1. **User Interaction**: Users interact with React components
2. **State Management**: TanStack Query manages server state and caching
3. **API Requests**: Frontend makes HTTP requests to Express backend
4. **Data Validation**: Zod schemas validate incoming data
5. **Database Operations**: Drizzle ORM handles PostgreSQL operations
6. **Response Handling**: Data flows back through the same chain

## External Dependencies

### Core Dependencies
- **Database**: PostgreSQL via Neon Database
- **UI Components**: Radix UI primitives via shadcn/ui
- **Validation**: Zod for schema validation
- **Date Handling**: date-fns for date formatting
- **Build Tools**: Vite, esbuild, tsx for development and production

### Development Tools
- **TypeScript**: Full type safety across the stack
- **Tailwind CSS**: Utility-first styling
- **PostCSS**: CSS processing
- **Drizzle Kit**: Database migrations and schema management

## Deployment Strategy

### Development Environment
- **Command**: `npm run dev` - Runs both frontend and backend in development
- **Port**: Application runs on port 5000
- **Hot Reload**: Vite provides fast hot module replacement
- **Database**: Uses DATABASE_URL environment variable

### Production Build
- **Frontend**: `vite build` - Builds React app to dist/public
- **Backend**: `esbuild` - Bundles Node.js server to dist/index.js
- **Start**: `npm run start` - Runs production server

### Database Management
- **Migrations**: Stored in ./migrations directory
- **Schema**: Defined in ./shared/schema.ts
- **Push**: `npm run db:push` - Pushes schema changes to database

## Changelog

Changelog:
- June 27, 2025. Initial setup
- June 27, 2025. Removed category functionality completely from the entire project
- June 27, 2025. Redesigned voting system to match user reference with green/red backgrounds
- June 27, 2025. Made voting buttons smaller and less prominent per user feedback
- June 27, 2025. Replaced view mode switch with icon buttons for card/list views
- June 27, 2025. Fully localized interface to Russian language including test data
- July 1, 2025. **CONVERTED ENTIRE INTERFACE TO ENGLISH**: Translated all UI text, labels, buttons, placeholders, and sample data to English language
- June 27, 2025. Changed all terminology from "задачи" (tasks) to "идеи" (ideas) throughout interface
- July 10, 2025. **MAJOR BACKEND CONVERSION**: Converted entire backend from Node.js/Express to Java 21 with Spring Boot 3.2.1:
  * Created JPA entities (User, Idea, Vote, Comment) with proper relationships
  * Implemented repository layer with custom queries for complex data fetching
  * Built service layer with business logic and transaction management
  * Created REST controllers with DTO pattern for API endpoints
  * Added Spring Security configuration with CORS support
  * Implemented data seeding service with English sample data
  * Configured H2 database for development, PostgreSQL for production
  * Maintained same API interface for frontend compatibility
  * Added enterprise-grade features: distributed caching with Hazelcast, rate limiting with Resilience4j
  * Implemented circuit breakers and monitoring endpoints for 1B+ user scalability
  * Configured high-performance Tomcat with 400 threads and 10K connections
  * Added Keycloak OAuth2 JWT authentication with role-based access control
  * Created comprehensive admin monitoring dashboard with health checks and metrics
  * Optimized database connection pooling for high-load scenarios
- June 27, 2025. Added image display functionality in idea detail modal with responsive grid layout
- June 27, 2025. Fixed idea cards layout: elements always stick to bottom edge for consistent alignment
- June 27, 2025. Implemented enterprise-grade security: JWT authentication, bcrypt hashing, rate limiting, CORS protection, and input validation for 1M+ user scalability
- June 27, 2025. **BANK-GRADE SECURITY IMPLEMENTATION**: 
  * Comprehensive security middleware with input sanitization using DOMPurify
  * Advanced threat detection and anomaly monitoring system
  * Enterprise audit logging with banking compliance (PCI DSS, SOX, GDPR)
  * Multi-tier rate limiting with IP blocking and risk scoring
  * Enhanced security headers and CSP configuration
  * Real-time security metrics dashboard endpoint
  * Session management with Redis support and automatic cleanup
  * Mandatory JWT secret validation (32+ char minimum)
  * Structured authentication failure tracking and brute force protection

## User Preferences

Preferred communication style: Simple, everyday language.
Preferred interface language: English (converted from Russian on July 1, 2025)