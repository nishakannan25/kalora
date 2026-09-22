# KALORA — "Your Craft. Your Story. Your Market."

AI-Driven Market Linkage & Smart Cataloging Platform for Marginalized Rural Artisans.
SIH Problem Statement: SIH26090

## Architecture Overview

```
kalora/
├── web/            # React + Vite + Tailwind CSS + React Router + i18n
├── mobile/         # React Native + Expo
├── backend/        # Node.js + Express + Prisma + PostgreSQL + JWT Auth
├── ai-service/     # AI service interfaces & provider abstractions
├── shared/         # Shared TypeScript types, validators & constants
├── docs/           # Documentation & API specs
└── README.md
```

## Setup & Running

### Prerequisites
- Node.js >= 18
- PostgreSQL database (or Prisma SQLite/PostgreSQL fallback)

### Backend Setup
```bash
cd backend
npm install
npx prisma db push
npm run dev
```

### Web Setup
```bash
cd web
npm install
npm run dev
```

### Mobile Setup
```bash
cd mobile
npm install
npx expo start
```
