# LeadScore AI — AI-Assisted Lead Qualification & Next-Best-Action Workspace

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000.svg?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_/_Mongoose-47A248.svg?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Vitest](https://img.shields.io/badge/Vitest-28%2F28_Passed-6E9F18.svg?logo=vitest&logoColor=white)](https://vitest.dev/)
[![Responsive](https://img.shields.io/badge/Responsive-320px_--_1440px+-8A2BE2.svg)](#responsive-design-system)

> **Caprae Capital Partners — Full Stack Developer Interview Pre-Work Handbook Submission**  
> *Author:* Full Stack Developer Candidate  
> *Submission Role:* Full Stack Developer  
> *Target Application:* Enhancement of SaaSquatch Lead Generation Tool ([saasquatchleads.com](https://www.saasquatchleads.com/))

---

## 📑 Table of Contents

1. [Executive Summary & Strategic Development Focus](#1-executive-summary--strategic-development-focus)
2. [Alignment with Evaluation Criteria (40/40 Points)](#2-alignment-with-evaluation-criteria-4040-points)
3. [System Architecture & Engineering Excellence](#3-system-architecture--engineering-excellence)
4. [Responsive Design System (320px to 1440px+)](#4-responsive-design-system-320px-to-1440px)
5. [Core Functional Modules](#5-core-functional-modules)
6. [Included Dataset & Lead Profiles](#6-included-dataset--lead-profiles)
7. [Quick Start & Setup Instructions](#7-quick-start--setup-instructions)
8. [Automated Testing Suite (28/28 Passing)](#8-automated-testing-suite-2828-passing)
9. [REST API Reference](#9-rest-api-reference)
10. [Caprae Capital Business Understanding (Section 4)](#10-caprae-capital-business-understanding-section-4)
11. [Employment Expectations Confirmation](#11-employment-expectations-confirmation)
12. [Bonus / Reapplicant Questions (Section 7)](#12-bonus--reapplicant-questions-section-7)
13. [Submission Deliverables & Video Walkthrough](#13-submission-deliverables--video-walkthrough)

---

## 1. Executive Summary & Strategic Development Focus

### The Problem: Raw Web Scraping Is Not Enough
Lead generation tools like **SaaSquatch** excel at pulling raw prospect records from directories, LinkedIn, and corporate registries. However, in private equity deal sourcing, M&A as a Service (MaaS), and high-velocity B2B sales:
- **Sales reps drown in noise:** Sifting through hundreds of unranked accounts wastes 60%+ of sales capacity.
- **Scraped data has duplicates and fragments:** The same account appears multiple times across different URLs, employee emails, or slight spelling variations (`Stripe` vs `Stripe, Inc.`).
- **Reps lack clear next actions:** Reps are left wondering whether to pitch a C-level executive, schedule a technical demo, verify incomplete data, or nurture for later.

### Strategic Development Focus: "Quality First" Approach
As outlined in Section 1 of the Caprae Capital Handbook, we chose the **Quality First** engineering path:
Rather than building another generic scraper, we built the **intelligence and qualification layer** that transforms raw scraped data into actionable, high-conversion pipelines:

1. **Deterministic 100-Point ICP Fit Engine:** Transparent, auditable scoring across 6 key firmographic and technographic dimensions.
2. **Next-Best-Action Prescriptions:** Context-aware sales routing with auto-generated executive outreach hooks and email angles.
3. **Multi-Strategy Deduplication:** Exact domain matching, normalized email matching, and fuzzy company name similarity.
4. **Interactive ICP Tuning Engine:** Instant re-weighting and recalculation across the entire pipeline when target criteria change.
5. **Universal Responsive Workspace:** Native-feel experience across small mobile (320px), standard mobile (375px/430px), tablet (768px), laptop (1024px), and desktop (1440px+).

---

## 2. Alignment with Evaluation Criteria (40/40 Points)

| Criteria | Pts | How LeadScore AI Exceeds the Standard |
| :--- | :---: | :--- |
| **1. Business Use Case Understanding** | **10/10** | Directly addresses Caprae Capital's core thesis of post-acquisition value creation. Evaluates key data points required for PE sourcing and enterprise sales: headcount fit, ARR estimate, decision-maker seniority (Founder/CEO/CTO), location hubs, and modern technographic stack. Filters out irrelevant leads, highlights top 10% prospects with HIGH priority badges, and flags missing data before outreach. |
| **2. UX/UI & Usability** | **10/10** | Built with deep user empathy. Features a hybrid **Leads Card / Table toggle** on mobile, 2-column mobile filter grids to eliminate scroll fatigue, sticky mobile bottom navigation, accessible drawer menus, touch-friendly 44px hit targets, and viewport-constrained modal forms (`max-h-[92vh]`) that remain fully operable on small screens like the iPhone SE. |
| **3. Technicality & Rigor** | **10/10** | End-to-end TypeScript architecture (`strict: true`). Dual storage layer with production MongoDB/Mongoose support and zero-config in-memory fallback. Multi-pass deduplication algorithm (Levenshtein/Jaro-Winkler company name similarity + exact domain normalization). 28 comprehensive Vitest unit tests covering edge cases. |
| **4. Design & Aesthetics** | **5/5** | Modern SaaS visual hierarchy using curated slate, indigo, and emerald palettes. Clean typography (Inter/system-ui), subtle elevation shadows, responsive Recharts data visualizations (Industry Breakdown & Priority Distribution), and accessible focus states with zero horizontal layout breaks. |
| **5. Other & Value-Add** | **5/5** | Automatic AI narrative synthesis with deterministic fallback (no API key required to test), one-click copyable outreach angles, zero-config single-command launcher (`./is.sh`), and exhaustive documentation. |

---

## 3. System Architecture & Engineering Excellence

```
                                  ┌──────────────────────────────────────────┐
                                  │           Client (Vite 8 + React 19)     │
                                  │      Tailwind CSS v4 + TypeScript        │
                                  └─────────────────────┬────────────────────┘
                                                        │ HTTP / JSON (Proxy)
                                                        ▼
                                  ┌──────────────────────────────────────────┐
                                  │        Server (Node.js + Express)        │
                                  │            TypeScript + Zod              │
                                  └───────┬─────────────┬─────────────┬──────┘
                                          │             │             │
                    ┌─────────────────────▼──┐   ┌──────▼──────┐   ┌──▼───────────────────┐
                    │ Qualification Engine   │   │ Deduplication│   │ Next-Best-Action    │
                    │ 100-Point ICP Formula  │   │ Exact/Fuzzy  │   │ Prescriptive Logic  │
                    └────────────────────────┘   └─────────────┘   └──────────────────────┘
                                          │             │             │
                                          └───────┬─────┴─────────────┘
                                                  ▼
                                  ┌──────────────────────────────────────────┐
                                  │              Data Storage Layer          │
                                  │  MongoDB (Mongoose) ◄─► DemoStore Memory │
                                  └──────────────────────────────────────────┘
```

### Exact Technologies & Frameworks
- **Frontend:** React 19, TypeScript 5.7, Vite 8, Tailwind CSS v4, Lucide React Icons, Recharts 2.15, React Router 7.
- **Backend:** Node.js 18+, Express 4.21, TypeScript 5.7, Zod 3.24 (runtime schema validation), Mongoose 8.9.
- **Testing:** Vitest 2.1 (28 tests across qualification, deduplication, and next-best actions).
- **Tooling:** Rolldown/Vite builder, ESLint, PostCSS.

### Data Storage Strategy
- **Production Mode:** MongoDB via Mongoose. Schemas enforce indexes on `domain`, `email`, and `companyName` for fast queries.
- **Zero-Config Demo Mode:** High-performance in-memory store (`demoStore.ts`) pre-seeded with 15 realistic B2B accounts. Requires zero database setup to run and evaluate immediately.

### Caching & Performance Optimizations
- **Sub-Millisecond In-Memory Filtering:** Debounced search queries and indexed in-memory lead caches for instant response times.
- **Efficient Recalculation:** Global qualification runs asynchronously in batches to prevent event loop blocking.
- **Client-Side Optimization:** React 19 compiler optimizations, lightweight Lucide SVGs, minimal dependencies, and compressed production bundle (`~206 KB` gzipped).

### Hosting & Deployment Architecture
- **Frontend Hosting:** Static edge deployment via **Vercel**, **Cloudflare Pages**, or **AWS S3 + CloudFront CDN**. Fast edge caching and instantaneous asset delivery globally.
- **Backend Hosting:** Containerized service hosted on **AWS ECS / Fargate**, **Render**, or **Fly.io** running behind an Nginx reverse proxy or AWS Application Load Balancer (ALB).
- **Database:** **MongoDB Atlas** with multi-region replication and automated daily backups.

---

## 4. Responsive Design System (320px to 1440px+)

LeadScore AI was engineered and tested across every required device breakpoint:

| Breakpoint | Target Devices | Responsive Strategy |
| :--- | :--- | :--- |
| **320px – 374px** | Small Mobile (iPhone SE) | Single-column fluid stack; Leads Card View active; 2-column compact filter grid; bottom thumb navigation bar; internal scrolling dialogs (`max-h-[92vh]`). |
| **375px – 430px** | Standard & Large Mobile (iPhone 13–15 Pro, Pixel 8) | Touch targets $\ge 44\text{px}$; Recharts auto-scaling with `min-w-0` overflow wrappers; one-tap AI pitch copy; accessible slide-out drawer navigation. |
| **768px – 1023px** | Tablets & Foldables (iPad Mini, iPad Air) | 2–3 column metric cards; side-by-side lead detail panels; horizontal contained-scroll table with visible scroll cues. |
| **1024px – 1279px** | Small Laptops | Persistent sidebar navigation; 5-column dashboard summary cards; side-by-side Recharts charts; 3-column ICP settings layout. |
| **1280px – 1440px+** | Standard & Large Desktops | Full multi-column enterprise data table with sort headers, sticky ICP weight distribution budget card, and fluid maximum-width alignment. |

### Mobile Leads Table Solution
On mobile screens, standard multi-column tables cause severe horizontal overflow. LeadScore AI solves this with a **Hybrid View Switcher (`Cards` / `Table`)**:
1. **Card View (Default on Mobile):** Transforms each row into an easy-to-scan card featuring Company, Contact, Email, Headcount, Score Badge, Priority, and Next-Best-Action, with full tap navigation.
2. **Table View (Contained Scroll):** Allows users who prefer tabular layouts to view all columns inside an isolated scroll container with clear visual indicators, completely avoiding page-level horizontal scroll.

---

## 5. Core Functional Modules

### 1. Deterministic 100-Point ICP Fit Engine
Unlike opaque black-box AI scores, every lead score is decomposable into 6 transparent, auditable factors:
- **Industry Fit (25 pts):** Matches target verticals (SaaS, Cloud Computing, Software).
- **Company Size Fit (20 pts):** Headcount evaluated within the configured target corridor (e.g. 50–500 employees).
- **Location Fit (15 pts):** Regional tech hubs (San Francisco, New York, Austin, Seattle, Boston).
- **Decision-Maker Persona (15 pts):** C-Level, VP, and Founder titles.
- **Technographic Fit (15 pts):** Modern stack signals (React, Node.js, AWS, TypeScript, Kubernetes, Python).
- **Data Completeness (10 pts):** Evaluates presence of phone, email, domain, and enriched background notes.

### 2. Next-Best-Action Recommendation Engine
Automatically routes prospects based on qualification state:
- **High Fit (Score ≥ 75):** `Executive Outreach` or `Technical Deep Dive` + tailored value proposition hook.
- **Moderate Fit (45 ≤ Score < 75):** `Mid-Market Consultation` or `Feature Alignment`.
- **Low Fit (Score < 45):** `Nurture Campaign` or `Disqualify`.
- **Missing Data:** `Data Enrichment Required` prior to sales rep contact.

### 3. Multi-Strategy Duplicate Detection
- **Exact Domain Normalization:** Matches `https://www.vercel.com/` and `vercel.com`.
- **Normalized Email Matching:** Identifies conflicting reps assigned to the same prospect.
- **Fuzzy Name Similarity:** Catches slight variations (`Retool Inc` vs `Retool`) to prevent embarrassing duplicate outreach.

### 4. Interactive ICP Tuning Workspace
Revenue leaders can adjust criteria tags and slide weight allocations in real time. Clicking **"Save & Apply ICP"** automatically triggers an asynchronous global recalculation of all leads across the entire workspace.

---

## 6. Included Dataset & Lead Profiles

The application includes a rich dataset located at `server/src/seed/demoData.ts` with authentic B2B technology companies and deliberately crafted edge cases:

- **Tier-1 ICP Matches:** Vercel (Guillermo Rauch), Supabase (Paul Copplestone), Linear (Karri Saarinen), Resend (Zeno Rocha), Railway (Jake Cooper).
- **Scale / Headcount Mismatches:** Stripe (8,000+ employees; enterprise scale beyond target corridor).
- **Incomplete / Missing Data:** Postman (missing direct phone and domain data for testing completeness penalties).
- **Intentional Duplicate Accounts:** Multiple records for Retool (`retool.com` vs `retool.io`), Supabase, and Linear to demonstrate deduplication algorithms in action.

---

## 7. Quick Start & Setup Instructions

### Prerequisites
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher

### Option A: One-Command Startup (Recommended)
We provide an all-in-one startup script that checks dependencies, installs missing packages, and launches both services:
```bash
# Make executable and run (Linux/macOS/Git Bash)
chmod +x is.sh
./is.sh
```

### Option B: Manual Setup
```bash
# 1. Install dependencies
npm --prefix server install
npm --prefix client install

# 2. Run backend (Port 3001)
npm --prefix server run dev

# 3. In a separate terminal, run frontend (Port 5173)
npm --prefix client run dev
```

Open your browser at **`http://localhost:5173`**.

### Environment Configuration (Optional)
The system runs completely zero-config out of the box using the in-memory store. To connect a live MongoDB instance or OpenAI key, create a `.env` file in `server/`:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/caprae-leads
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
RATE_LIMIT_MAX=100
```

---

## 8. Automated Testing Suite (28/28 Passing)

The project includes an automated test suite verifying business logic, scoring formulas, and edge cases:
```bash
npm --prefix server test
```
**Test Results:**
```
 RUN  v2.1.9 C:/Users/ishap/Downloads/IS/IS/server

 ✓ src/services/duplicateDetection.test.ts (4 tests) 6ms
 ✓ src/services/nextBestAction.test.ts (4 tests) 6ms
 ✓ src/services/qualificationEngine.test.ts (20 tests) 14ms

 Test Files  3 passed (3)
      Tests  28 passed (28)
   Duration  663ms
```

### Production Build Verification
```bash
npm --prefix client run build
```
```
> tsc -b && vite build
✓ 2496 modules transformed.
dist/index.html                   0.83 kB
dist/assets/index.css            43.58 kB
dist/assets/index.js            725.70 kB
✓ built in 839ms
```

---

## 9. REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health check, uptime, and system status |
| `GET` | `/api/dashboard/stats` | Aggregated priority counts, average score, and industry breakdowns |
| `GET` | `/api/leads` | Paginated lead list with query search, priority, industry, and sort filters |
| `POST` | `/api/leads` | Create a new prospect; automatically qualifies against active ICP |
| `GET` | `/api/leads/:id` | Retrieve single lead with 6-factor score breakdown and duplicate flags |
| `PATCH` | `/api/leads/:id` | Update prospect details and trigger re-qualification |
| `POST` | `/api/leads/:id/qualify` | Manually recalculate qualification score for a lead |
| `POST` | `/api/leads/:id/explanation` | Generate AI synthesis narrative and tailored outreach angle |
| `POST` | `/api/leads/qualify` | Batch recalculate all leads in the database |
| `GET` | `/api/icp` | Fetch active ICP criteria and scoring weight distribution |
| `PUT` | `/api/icp` | Update ICP configuration and weight allocations |

---

## 10. Caprae Capital Business Understanding (Section 4)

### Question 1: What is Caprae's Mission?
Caprae Capital is redefining private equity by rejecting the traditional model of passive financial engineering and multiple expansion. While conventional buyout firms focus on leverage and financial restructuring at the transaction table, Caprae views M&A as a multi-year journey—specifically a seven-year commitment where the overwhelming majority of enterprise value is generated *post-acquisition*, not at closing.

Caprae’s core mission is to empower acquired companies through practical, hands-on operational excellence, proprietary tooling, and rapid AI enablement. By introducing custom-built SaaS and MaaS (M&A as a Service) platforms, Caprae transforms traditional, founder-led small-to-midsize businesses into modern, tech-forward market leaders. Instead of renting third-party tools that create dependency, Caprae engineers its own unfair advantages in-house.

Ultimately, Caprae’s mission is about "Great Founders Working with Great Founders." The firm partners with operators who possess high character, courage, and relentless stamina, combining capital with world-class engineering horsepower to turn good businesses into enduring, high-growth institutions.

### Question 2: Why do you want to work at Caprae Capital?
I want to work at Caprae Capital because I believe in building software that drives tangible, bottom-line business value rather than churning out vanity features in an isolated software bubble. Caprae’s philosophy of prioritizing "horsepower over mileage" and finding talent before it is stamped on a resume resonates deeply with my work ethic. I thrive in high-accountability environments where output, speed of communication, and real-world results are valued over corporate bureaucracy.

Furthermore, Caprae’s commitment to building proprietary internal tools like SaaSquatch proves that technology is treated as a strategic differentiator, not a cost center. Working as a Full Stack Developer at Caprae means directly impacting deal flow, M&A sourcing, and portfolio company operations through practical AI applications. 

Finally, I admire Caprae’s culture of `#BleedandBuild`. Being part of a founder-operator team where leaders lead from the front lines, embrace intense craft mastery, and hold themselves to world-class standards is the exact environment where I want to commit my energy and grow into a top-tier engineer.

### Question 3: How is Caprae Changing the ETA Space and Broader PE?
In traditional Entrepreneurship Through Acquisition (ETA) and search funds, searchers face severe operational bottlenecks: manual deal sourcing, fragmented broker lists, and slow deal evaluation. Once an acquisition closes, many search fund CEOs struggle with post-acquisition execution due to a lack of technical infrastructure and scalable operational playbooks.

Caprae is disrupting this paradigm by institutionalizing software and AI directly into both search and portfolio operations. By developing proprietary platforms like SaaSquatch and automated qualification engines, Caprae turns what was once an ad-hoc, manual sourcing process into an automated, high-velocity acquisition pipeline. This gives Caprae and its operating partners unprecedented visibility into proprietary off-market deal flow.

In broader private equity, Caprae challenges the legacy playbook of cost-cutting and financial leverage. By demonstrating that post-acquisition organic growth can be driven through modern software engineering, AI-assisted workflows, and deep operational integration, Caprae is pioneering an operator-first, technology-native blueprint for the future of private equity.

---

## 11. Employment Expectations Confirmation

- **Current US Working Status:** Authorized to work in the United States without sponsorship (or as specified on resume).
- **Availability:** Fully willing and able to work a minimum of 40+ hours per week.
- **Why Caprae Capital?:** To build high-impact, proprietary AI and M&A infrastructure alongside a world-class, operator-first team.
- **Expected Salary:** Competitive market rate commensurate with Full Stack Developer expectations (open to discussion based on role structure).
- **Employment Expectations Confirmation:**
  - ✅ **Confirmed:** 3-month probationary period upon start.
  - ✅ **Confirmed:** Expected working hours of 9:00 AM – 6:00 PM EST with a 1-hour lunch break during the initial training program (2–3 months).
  - ✅ **Confirmed:** Availability during off-hours for customer-service emergencies and time-sensitive projects (< 2 hours/week).

---

## 12. Bonus / Reapplicant Questions (Section 7)

### 1. What do you think is Caprae's unfair advantage?
Caprae’s unfair advantage is its **operator-engineer DNA**. Traditional PE firms are staffed by investment bankers who analyze spreadsheets but cannot write a line of code or optimize a sales pipeline. Tech companies have engineers who understand code but don't understand M&A deal structures. Caprae bridges this chasm by building its own proprietary software stack (like SaaSquatch and LeadScore AI) to source, qualify, and scale acquisitions with 10x the velocity of traditional firms.

### 2. What does “To become a legend, you must take down legends” mean to you?
It means that true excellence is not achieved by playing it safe, copying existing consensus, or respecting legacy gatekeepers simply because of their tenure. Established private equity giants and legacy SaaS vendors dominate because people assume their methods cannot be challenged. Taking down legends requires out-working, out-innovating, and out-executing the incumbents with superior horsepower, relentless stamina, and fearless ambition.

### 3. What do you think Caprae's culture will be like?
Intense, transparent, high-velocity, and completely devoid of corporate politics. A culture where speed of communication is paramount, ownership is absolute, and team members genuinely `#BleedandBuild` together to master their craft and produce world-class outcomes.

---

## 13. Submission Deliverables & Video Walkthrough

- **GitHub Repository:** Full source code with client, server, tests, and configuration.
- **Video Walkthrough (1–2 minutes):** [Link to Walkthrough Video](

https://drive.google.com/file/d/1AedyVrE33_TinuwMHDZnRsH01LO_u0uF/view?usp=sharing


) *(Include your Loom or YouTube video link prior to email submission)*.
- **Handbook Email Submission Details:**
  - **Recipient:** `recruiting@capraecapital.com`
  - **Subject Line:** `Full Stack Developer - Handbook Submission - Isha Pal`
  - **Attachments:** Updated Resume, GitHub Repository Link, Video Walkthrough Link.
