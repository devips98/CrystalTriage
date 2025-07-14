# HyperLocal - Location-Based Social Media App

## Overview

HyperLocal is a mobile-first, location-based social media web application built with a modern full-stack architecture. The app allows users to share content (posts, confessions, challenges) with people in their immediate vicinity, creating authentic local community experiences. Key features include real-time location sharing, temporary content (geo time capsules), truth mode for verified authentic content, and proximity-based interactions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a full-stack TypeScript architecture with clear separation between client and server code:

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development
- **Styling**: TailwindCSS with shadcn/ui component library for consistent design
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with custom styling via class-variance-authority

### Backend Architecture
- **Runtime**: Node.js with Express.js for REST API endpoints
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Real-time**: WebSocket connections for live updates and proximity alerts
- **File Storage**: Local file system with multer for image/video uploads

## Key Components

### 1. Location Services
- HTML5 Geolocation API for precise location tracking
- Real-time proximity detection for nearby users
- Configurable visibility radius (50m to 5km)
- Location-based content filtering

### 2. Camera Integration
- WebRTC camera access for photo/video capture
- Front/back camera switching capability
- Real-time photo capture with HTML5 Canvas
- Mobile-optimized camera interface

### 3. Content Types
- **Posts**: Location-tagged content with images/videos
- **Confessions**: Anonymous local sharing within 200m
- **Challenges**: Community-driven location-based tasks
- **Geo Time Capsules**: Delayed content release at specific locations
- **Geo Swap**: Location-based item exchange system

### 4. Real-time Features
- WebSocket connections for live updates
- Proximity alerts when users enter/leave area
- Real-time content notifications
- Live user count display

### 5. Trust & Safety
- User trust scoring system (0-100)
- Anonymous posting options
- Content expiration mechanisms
- Truth Mode for verified authentic content

## Data Flow

1. **User Authentication**: Session-based auth with PostgreSQL session storage
2. **Location Tracking**: Continuous geolocation monitoring with user consent
3. **Content Creation**: Camera → Capture → Upload → Database → Real-time broadcast
4. **Content Discovery**: Location query → Radius filter → Content retrieval
5. **Real-time Updates**: WebSocket events → Client state updates → UI refresh

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **multer**: File upload handling
- **ws**: WebSocket server implementation

### Development Tools
- **Vite**: Fast build tool and dev server
- **TypeScript**: Type safety across the stack
- **TailwindCSS**: Utility-first CSS framework
- **esbuild**: Fast JavaScript bundler for production

### Browser APIs
- **Geolocation API**: Location tracking
- **WebRTC**: Camera and media access
- **WebSocket**: Real-time communication
- **Canvas API**: Image processing and manipulation

## Deployment Strategy

### Development Setup
- Vite dev server with HMR for frontend development
- Express server with automatic restarts
- Database migrations with Drizzle Kit
- Environment-based configuration

### Production Build
- Vite builds optimized static assets
- esbuild bundles server code for Node.js
- Static assets served from Express
- Database connection pooling with Neon

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string
- File uploads stored in local `uploads/` directory
- Session storage in PostgreSQL with `connect-pg-simple`
- CORS and security headers configured

### Mobile Optimization
- PWA-ready with proper meta tags
- Mobile-first responsive design
- Touch-optimized interactions
- Offline capability planning (partial implementation)

The application is designed to be deployed on platforms like Replit, Vercel, or any Node.js hosting service with PostgreSQL database support.