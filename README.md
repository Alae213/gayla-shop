# Gayla Shop 🛍️

A modern, full-stack e-commerce platform built for the Algerian market with integrated delivery cost calculation and order management.

## ✨ Features

### Customer-Facing
- **Product Catalog** - Browse products with images, descriptions, and variants (size/color)
- **Real-time Delivery Costs** - Automatic calculation based on wilaya and delivery type (Stopdesk/Domicile)
- **Multi-language Support** - Arabic, French, and English localization
- **Responsive Design** - Mobile-first UI built with Tailwind CSS
- **Order Tracking** - Customers receive order confirmations and updates

### Admin Dashboard
- **Product Management** - Create, edit, archive products with drag-and-drop image uploads
- **Order Management** - Track orders through multiple statuses (new, confirmed, packaged, shipped, etc.)
- **Call Center Tools** - Log call attempts, track customer interactions, flag fraudulent orders
- **Site Content Editor** - Manage homepage hero section with rich text editor
- **Analytics Dashboard** - View order statistics and product performance
- **Delivery Integration** - ZR Express API integration for shipping

### Backend Features
- **Real-time Database** - Powered by Convex with automatic synchronization
- **Email Notifications** - Order confirmations via Resend
- **Fraud Detection** - Basic fraud scoring based on customer behavior
- **Automated Cron Jobs** - Scheduled tasks for delivery cost updates
- **Secure Authentication** - Admin login with bcrypt password hashing

## 🛠️ Tech Stack

### Frontend
- **[Next.js 16](https://nextjs.org/)** - React framework with App Router and Turbopack
- **[React 19](https://react.dev/)** - UI library with latest features
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - High-quality React components
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Lucide Icons](https://lucide.dev/)** - Modern icon library

### Backend
- **[Convex](https://convex.dev/)** - Real-time backend with TypeScript functions
- **[Resend](https://resend.com/)** - Transactional email service
- **[Zod](https://zod.dev/)** - Schema validation
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)** - Password hashing

### UI Components & Libraries
- **[TipTap](https://tiptap.dev/)** - Rich text editor for content management
- **[React Hook Form](https://react-hook-form.com/)** - Performant form library
- **[TanStack Table](https://tanstack.com/table)** - Powerful data tables
- **[Recharts](https://recharts.org/)** - Chart library for analytics
- **[dnd-kit](https://dndkit.com/)** - Drag and drop functionality
- **[date-fns](https://date-fns.org/)** - Date manipulation
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications

### Development Tools
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Vitest](https://vitest.dev/)** - Unit testing framework
- **[Testing Library](https://testing-library.com/)** - React component testing

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.17 or later ([Download](https://nodejs.org/))
- **npm** or **yarn** (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Convex Account** (free) - [Sign up](https://convex.dev/)
- **Resend Account** (optional, for emails) - [Sign up](https://resend.com/)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Alae213/gayla-shop.git
cd gayla-shop
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Convex Backend

Run Convex initialization (this will create `.env.local` automatically):

```bash
npx convex dev
```

This command will:
- Prompt you to log in/sign up to Convex
- Create a new project
- Deploy the database schema
- Generate environment variables
- Start watching for backend changes

**Keep this terminal running.**

### 4. Configure Environment Variables

Your `.env.local` file should now exist with Convex variables. Add the remaining variables:

```bash
# Already added by Convex
CONVEX_DEPLOYMENT=dev:your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Add these manually:
RESEND_API_KEY=re_xxxxxxxxxxxx          # Get from https://resend.com/api-keys
ADMIN_EMAIL=admin@gayla.dz              # Your admin email for notifications
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development

# ZR Express (optional for development)
ZR_EXPRESS_API_URL=https://procolis.com/api/v1
ZR_EXPRESS_TOKEN=your_token_here
ZR_EXPRESS_KEY=your_key_here
```

**See `.env.example` for detailed documentation of all variables.**

### 5. Start Development Server

In a new terminal (keep Convex running):

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Create Admin Account (Optional)

Run the admin setup script:

```bash
npm run create-admin
```

Then access the admin panel at [http://localhost:3000/admin](http://localhost:3000/admin)

See [docs/ADMIN_SETUP.md](docs/ADMIN_SETUP.md) for details.

## 📜 Available Scripts

```bash
npm run dev          # Start Next.js dev server with Turbopack
npm run build        # Build production bundle
npm start            # Start production server
npm run lint         # Run ESLint
npm test             # Run Vitest tests
npx convex dev       # Start Convex backend (keep running during development)
npx convex deploy    # Deploy Convex to production
```

## 📁 Project Structure

```text
gayla-shop/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Public-facing pages
│   │   ├── page.tsx              # Homepage
│   │   └── products/             # Product listing and details
│   ├── admin/                    # Admin dashboard routes
│   │   ├── products/             # Product management
│   │   ├── orders/               # Order management
│   │   └── analytics/            # Analytics dashboard
│   ├── api/                      # API routes
│   │   └── zr-express/           # Delivery API integration
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui base components
│   ├── admin/                    # Admin-specific components
│   └── public/                   # Customer-facing components
│
├── convex/                       # Convex backend
│   ├── schema.ts                 # Database schema definition
│   ├── products.ts               # Product queries and mutations
│   ├── orders.ts                 # Order management functions
│   ├── auth.ts                   # Authentication logic
│   ├── deliveryCosts.ts          # Delivery cost calculations
│   ├── siteContent.ts            # CMS functions
│   ├── emails.ts                 # Email sending functions
│   └── crons.ts                  # Scheduled tasks
│
├── hooks/                        # Custom React hooks
├── lib/                          # Utility functions and helpers
├── providers/                    # React context providers
├── public/                       # Static assets
├── scripts/                      # Utility scripts
│
├── docs/                         # Documentation
│   ├── SETUP.md                  # Detailed setup guide
│   ├── ADMIN_SETUP.md            # Admin account setup
│   └── ARCHITECTURE.md           # System architecture
│
├── .env.example                  # Environment variables template
├── components.json               # shadcn/ui configuration
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
└── tsconfig.json                 # TypeScript configuration
```

## 🗄️ Database Schema

The Convex backend uses these main tables:

- **products** - Product catalog with images, variants, and status
- **orders** - Customer orders with tracking and delivery info
- **adminUsers** - Admin authentication
- **deliveryCosts** - Wilaya-based delivery pricing
- **siteContent** - Homepage and site configuration

See [convex/schema.ts](convex/schema.ts) for detailed schema definitions.

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `CONVEX_DEPLOYMENT` | Convex deployment URL | ✅ |
| `NEXT_PUBLIC_CONVEX_URL` | Public Convex URL | ✅ |
| `RESEND_API_KEY` | Resend API key for emails | ⚠️ Optional (emails disabled without it) |
| `ADMIN_EMAIL` | Admin notification email | ⚠️ Optional |
| `NEXT_PUBLIC_SITE_URL` | Site URL for links | ✅ |
| `ZR_EXPRESS_API_URL` | ZR Express API endpoint | ⚠️ Optional (uses mock data) |
| `ZR_EXPRESS_TOKEN` | ZR Express auth token | ⚠️ Optional |
| `ZR_EXPRESS_KEY` | ZR Express API key | ⚠️ Optional |
| `NODE_ENV` | Environment (development/production) | ✅ |

See [.env.example](.env.example) for complete documentation.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## 📱 Features in Development

- [ ] Customer account system
- [ ] Wishlist functionality
- [ ] Advanced search and filtering
- [ ] Product reviews and ratings
- [ ] Social media integration
- [ ] Advanced analytics dashboard

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🆘 Support & Documentation

- **Setup Issues**: See [docs/SETUP.md](docs/SETUP.md) for troubleshooting
- **Architecture**: See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for system design
- **Admin Setup**: See [docs/ADMIN_SETUP.md](docs/ADMIN_SETUP.md) for admin configuration

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Backend powered by [Convex](https://convex.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

---

**Made with ❤️ for the Algerian e-commerce market**