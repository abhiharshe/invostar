# Project Context: InvoStar — Billing & Inventory Management Backend

InvoStar is a modular, production-ready REST API backend for a billing and inventory management application. It handles the full lifecycle of sales, purchases, payments, expenses, product management, and customer/supplier ledgers — designed to serve any business type.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Language** | TypeScript 5.7+ |
| **Runtime** | Node.js |
| **Framework** | NestJS 11 |
| **Database** | MySQL (via Prisma ORM 7) |
| **ORM / Migrations** | Prisma (with `@prisma/adapter-mariadb`) |
| **Authentication** | JWT (`@nestjs/jwt` + `passport-jwt`) — access token + refresh token |
| **Authorization** | Role-Based Access Control (RBAC) — `ADMIN` / `STAFF` roles |
| **Validation** | `class-validator` + `class-transformer` |
| **API Documentation** | Swagger / OpenAPI (`@nestjs/swagger`) — available at `/api/docs/` |
| **Logging** | `nestjs-pino` with `pino-pretty` (dev) |
| **Security** | `helmet`, CORS with allowlist |
| **Testing** | Jest 30 (unit) + Supertest (e2e) |
| **Linting / Formatting** | ESLint 9 + Prettier 3 |
| **Build** | NestJS CLI (`nest build`) → `dist/` |

---

## Project Information

- **App Name**: InvoStar Billing API
- **Version**: 0.0.1
- **Default Port**: `3001`
- **Global API Prefix**: `/api`
- **Swagger Docs**: `/api/docs/`
- **Frontend URL** (CORS): configured via `WEB_APP_URL` env var (default: `http://localhost:3000`)

---

## Folder Architecture

```
billing-backend/
├── src/
│   ├── main.ts                        # Bootstrap: Helmet, CORS, Swagger, ValidationPipe, global interceptors/filters
│   ├── app.module.ts                  # Root module — imports all feature modules
│   ├── app.controller.ts
│   ├── app.service.ts
│   │
│   ├── common/                        # Shared cross-cutting concerns
│   │   ├── decorators/
│   │   │   └── current-user.decorator.ts   # @CurrentUser() param decorator
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts    # Global HTTP exception handler
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts           # JWT authentication guard
│   │   └── interceptors/
│   │       └── response.interceptor.ts     # Standardised API response envelope
│   │
│   ├── database/
│   │   └── prisma.module.ts           # Global Prisma service module
│   │
│   ├── modules/                       # Feature modules (NestJS modular architecture)
│   │   ├── auth/                      # Authentication (login, refresh, logout)
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   ├── dto/
│   │   │   └── types/
│   │   ├── customers/                 # Customer CRUD & ledger
│   │   ├── suppliers/                 # Supplier CRUD & ledger
│   │   ├── products/                  # Product & ProductType management (with bundle support)
│   │   ├── sales/                     # Sales invoices & quotations
│   │   ├── purchases/                 # Purchase bills from suppliers
│   │   ├── payments/                  # Customer receipts & supplier payments
│   │   ├── expenses/                  # Business expense tracking
│   │   ├── dashboard/                 # Aggregated stats/metrics
│   │   ├── settings/                  # Key-value store for app configuration
│   │   └── health/                    # Health check endpoint
│   │
│   ├── scripts/
│   │   └── seed-admin.ts              # Admin user seeder (run with `npm run seed:admin`)
│   │
│   └── generated/                     # Prisma generated types/client (auto-generated)
│
├── prisma/
│   ├── schema.prisma                  # Database schema & models
│   └── migrations/                    # Prisma migration history
│
├── test/
│   └── jest-e2e.json                  # e2e test config
│
├── dist/                              # Compiled output (gitignored)
├── .env                               # Local environment variables (gitignored)
├── .env.example                       # Environment variable template
├── nest-cli.json                      # NestJS CLI config (sourceRoot: src)
├── tsconfig.json
├── tsconfig.build.json
├── eslint.config.mjs
├── .prettierrc
└── package.json
```

---

## Database Schema (Prisma Models)

| Model | Description |
|---|---|
| `User` | Auth credentials, role (`ADMIN`/`STAFF`), refresh token hash |
| `ProductType` | Product category grouping (e.g., Electronics, Clothing) |
| `Product` | Products with unit, rate, tax%, category, and bundle support |
| `BundleItem` | Many-to-many junction for bundled products |
| `Customer` | Customer info with opening balance, GSTIN, billing/shipping address |
| `Supplier` | Supplier info with opening balance |
| `Sale` | Sales invoice / quotation with status lifecycle |
| `SaleItem` | Line items on a sale (product snapshot + qty/rate/tax) |
| `Purchase` | Purchase bill from a supplier |
| `PurchaseItem` | Line items on a purchase |
| `Payment` | Customer receipts or supplier payments (`CASH`/`ONLINE`/`CHEQUE`) |
| `PaymentAllocation` | Allocates a payment against specific sales/purchases |
| `Expense` | Business expenses by category and date |
| `Setting` | Key-value store for runtime configuration |

### Enums

| Enum | Values |
|---|---|
| `Role` | `ADMIN`, `STAFF` |
| `DocumentStatus` | `DRAFT`, `QUOTATION`, `CONVERTED`, `UNPAID`, `PARTIALLY_PAID`, `PAID`, `VOIDED` |
| `PaymentType` | `CUSTOMER_RECEIPT`, `SUPPLIER_PAYMENT` |
| `PaymentMode` | `CASH`, `ONLINE`, `CHEQUE` |
| `ProductCategory` | `PHYSICAL_GOODS`, `DIGITAL_GOODS`, `SERVICES`, `LABOR` |

---

## Key Architectural Patterns

- **Modular NestJS**: Each domain (sales, purchases, etc.) is a self-contained module with its own controller, service, and DTOs.
- **Global response envelope**: All API responses are wrapped by `ResponseInterceptor` for a consistent `{ data, message, statusCode }` shape.
- **Global exception filter**: `HttpExceptionFilter` standardises error responses.
- **Validation**: `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true` — unknown fields are rejected automatically.
- **Auth flow**: Access token (short-lived) + Refresh token (hashed in DB). `JwtAuthGuard` protects routes; `@CurrentUser()` decorator extracts the authenticated user from the request.
- **Prisma as single DB layer**: A global `PrismaModule` exports `PrismaService` for use across all feature modules.

---

## Environment Variables

```env
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/invostar"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="8h"
ADMIN_NAME="Administrator"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="replace-with-a-strong-password"
WEB_APP_URL="http://localhost:3000"
PORT=3001
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run start:dev` | Start with hot-reload (development) |
| `npm run start:prod` | Run compiled `dist/main` (production) |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm run test` | Run unit tests (Jest) |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run test:cov` | Run tests with coverage report |
| `npm run seed:admin` | Seed the initial admin user |
| `npm run lint` | Lint and auto-fix with ESLint |
| `npm run format` | Format code with Prettier |
| `npx prisma migrate dev` | Apply new migrations (dev) |
| `npx prisma migrate deploy` | Apply migrations (production) |
| `npx prisma studio` | Open Prisma Studio (DB GUI) |

---

## Getting Started

### Prerequisites
- Node.js 20+
- MySQL 8+ (or MariaDB 10.6+)
- npm

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill in environment variables
cp .env.example .env

# 3. Run database migrations
npx prisma migrate deploy

# 4. Seed the admin user
npm run seed:admin

# 5. Start in development mode
npm run start:dev
```

The API will be available at `http://localhost:3001/api`.
Swagger UI will be at `http://localhost:3001/api/docs/`.