# LeadScore AI — AI-Assisted Lead Qualification & Next-Best-Action Workspace

> **Caprae Capital Full Stack Developer Assignment: AI-Readiness / Lead Generation Enhancement**
> A production-grade B2B workspace designed to help revenue and sales teams identify high-fit prospects, eliminate duplicates, and execute context-aware next best actions.

---

## 🚀 Overview

Modern sales and SDR teams lose hours each week sifting through unstructured inbound and outbound leads, manually cross-referencing firmographic data against criteria, and wondering who to reach out to first. 

**LeadScore AI** solves this with an enterprise-ready qualification workspace featuring:
1. **Deterministic ICP Fit Scoring Engine**: Transparent, auditable 100-point rubric assessing industry fit, headcount size, location, decision-maker title, technographics, and data completeness.
2. **Next-Best-Action Recommendation Engine**: Context-driven action prompts (Executive Outreach, Technical Deep Dive, Data Enrichment, Nurture) with pre-generated outreach hooks tailored to each lead.
3. **Fuzzy & Exact Duplicate Detection**: Flags overlapping records based on exact normalized domain, exact email, and company name string similarity.
4. **AI Narrative Synthesis with Deterministic Fallbacks**: Natural language explanation of fit criteria and deal positioning powered by AI (OpenAI API / rule-based fallback).
5. **Interactive ICP Tuning Workspace**: Real-time adjustment of target criteria and weight distribution with instant global lead recalculation.
6. **Graceful Zero-Config Mode**: Seamlessly operates in-memory with pre-loaded mock data out of the box, or connects directly to MongoDB when configured.

---

## 🏗️ Architecture & Tech Stack

```
IS/
├── client/                     # Frontend Application
│   ├── src/
│   │   ├── components/         # Layout & Shared UI Design System
│   │   ├── features/
│   │   │   ├── dashboard/      # Analytics, Funnel Charts, Filterable Lead Table
│   │   │   ├── lead-detail/    # Score Breakdown, Next Action, AI Narrative, Profile
│   │   │   ├── icp/            # Interactive ICP Criteria & Weight Configurator
│   │   │   └── leads/          # New Prospect Creation Modal
│   │   ├── lib/api.ts          # Strongly typed client API client
│   │   └── types/              # Domain & DTO interfaces
├── server/                     # Backend API Service
│   ├── src/
│   │   ├── controllers/        # Lead, ICP, and AI endpoint handlers
│   │   ├── middleware/         # Error handling, validation, rate limiting
│   │   ├── models/             # Mongoose schemas for MongoDB
│   │   ├── routes/             # REST API routing
│   │   ├── services/
│   │   │   ├── qualificationEngine.ts   # Core 100-point scoring algorithm
│   │   │   ├── nextBestAction.ts        # Prescriptive sales action logic
│   │   │   ├── duplicateDetection.ts    # Exact & fuzzy deduplication
│   │   │   ├── aiExplanation.ts         # LLM synthesis with robust fallback
│   │   │   └── demoStore.ts             # High-performance in-memory fallback store
│   │   ├── validators/         # Zod request validation schemas
│   │   └── types.ts            # Core TypeScript domain models
└── package.json                # Unified workspace root scripts
```

### Frontend
- **React 19 & TypeScript**: Strict types, fast render cycles, custom hooks.
- **Vite 8**: Rapid HMR and optimized production bundling.
- **Tailwind CSS v4 & Lucide Icons**: Modern, high-density SaaS user experience.
- **Recharts**: Responsive priority distribution pie charts and industry breakdown bar charts.
- **React Router 7**: Client-side routing with clean nested layout.

### Backend
- **Node.js & Express**: High-throughput REST API.
- **TypeScript**: Shared type contracts and end-to-end type safety.
- **Vitest**: Unit & integration test suite (28 comprehensive test cases).
- **Zod**: Robust runtime request validation.
- **Mongoose / Memory Fallback**: Dual storage model supporting production MongoDB or zero-config in-memory operation.

---

## ⚡ Quick Start

### Prerequisites
- Node.js >= 18
- npm >= 9

### 1. Installation
Install dependencies across both client and server:
```bash
npm --prefix server install
npm --prefix client install
```

### 2. Run Tests
Execute the comprehensive test suite verifying the qualification engine, duplicate detection, and next-best-action rules:
```bash
npm test
# Or: npm --prefix server test
```
All 28 tests pass:
```
 ✓ src/services/qualificationEngine.test.ts (20)
 ✓ src/services/duplicateDetection.test.ts (4)
 ✓ src/services/nextBestAction.test.ts (4)
 Test Files  3 passed (3)
      Tests  28 passed (28)
```

### 3. One-Command Quick Start
Simply run the startup script to start both backend and frontend automatically:
```bash
./is.sh
```

Or run them individually:
- Backend: `npm --prefix server run dev` (Port 3001)
- Frontend: `npm --prefix client run dev` (Port 5173)

Open your browser at **`http://localhost:5173`**.

---

## ⚙️ Configuration & Environment Variables

Create a `.env` file in `server/` (optional; defaults will be used if omitted):

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/caprae-leads   # Optional: falls back to in-memory store
OPENAI_API_KEY=your_key_here                          # Optional: falls back to rule-based synthesis
OPENAI_MODEL=gpt-4o-mini
RATE_LIMIT_MAX=100
```

---

## 📊 Core Capabilities

### 1. Transparent 100-Point Scoring Model
Unlike opaque black-box AI scores, every lead score is decomposable into 6 objective factors:
- **Industry Fit (25 pts)**: Strict match with target vertical.
- **Company Size Fit (20 pts)**: Scaled points based on headcount within ideal corridor.
- **Location Fit (15 pts)**: Target metropolitan hubs and regions.
- **Decision-Maker Persona (15 pts)**: Seniority level (C-level, VP, Director).
- **Technographic Fit (15 pts)**: Modern tech stack compatibility.
- **Data Completeness (10 pts)**: Evaluates presence of phone, domain, title, and notes.

### 2. Next-Best-Action Prescriptions
Automates the SDR decision workflow:
- **High Fit (Score ≥ 75)**: Executive Outreach / Technical Discovery call + generated personalized pitch.
- **Moderate Fit (45 ≤ Score < 75)**: Mid-market consultation or feature alignment.
- **Low Fit (Score < 45)**: Educational nurture sequence or disqualify.
- **Missing Critical Data**: Contact enrichment action before outreach.

### 3. Duplicate Detection & Grouping
- Exact domain matching (e.g. `stripe.com` vs `http://www.stripe.com/`).
- Normalized email matching.
- Fuzzy company name similarity to prevent fragmented account activity.

---

## 🛠️ REST API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | `GET` | System health check and uptime |
| `/api/dashboard/stats` | `GET` | Aggregated priority, score, and industry statistics |
| `/api/leads` | `GET` | Paginated leads with search, priority, industry, and sort filters |
| `/api/leads` | `POST` | Create a prospect and automatically qualify against active ICP |
| `/api/leads/:id` | `GET` | Fetch single lead with score breakdown and duplicate flags |
| `/api/leads/:id` | `PATCH` | Update prospect details and trigger re-qualification |
| `/api/leads/:id/qualify` | `POST` | Manually recalculate qualification for a lead |
| `/api/leads/:id/explanation` | `POST` | Generate natural language AI synthesis of qualification |
| `/api/leads/qualify` | `POST` | Batch recalculate all leads |
| `/api/icp` | `GET` | Retrieve active ICP rules and scoring weights |
| `/api/icp` | `PUT` | Update ICP configuration and weights |

---

## 🧪 Testing Summary

The project includes thorough unit tests covering:
- **Qualification Engine**: Full fit, partial fit, zero fit, boundary company sizes, missing data degradation, weight adjustments.
- **Next-Best-Action**: High score routing, low score routing, missing data routing, custom urgency tagging.
- **Duplicate Detection**: Exact domains, exact email clashes, normalized corporate names, clean unique sets.

Run `npm test` anytime to verify all tests.
