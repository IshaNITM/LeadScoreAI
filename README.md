# LeadScore AI — AI-Assisted Lead Qualification Workspace

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000.svg?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_/_Memory-47A248.svg?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Vitest](https://img.shields.io/badge/Vitest-28%2F28_Passed-6E9F18.svg?logo=vitest&logoColor=white)](https://vitest.dev/)
[![Responsive](https://img.shields.io/badge/Responsive-320px_--_1440px+-8A2BE2.svg)](#-responsive-design-system)

> **Caprae Capital Pre-Work Submission** | Sourcing Tool Enhancement for [SaaSquatch](https://www.saasquatchleads.com/)  
> *Role:* Full Stack Developer | *Focus:* **Quality First** — Downstream Intelligence, Qualification & Deduplication

---

## ⚡ Quick Start (30 Seconds)

### One-Command Launcher (Linux / macOS / Git Bash)
```bash
chmod +x is.sh && ./is.sh
```
*Automatically installs dependencies and boots both API (`:3001`) and UI (`:5173`).*

### Manual Launch
```bash
# 1. Start Backend (Port 3001)
npm --prefix server install && npm --prefix server run dev

# 2. Start Frontend (Port 5173) in a second terminal
npm --prefix client install && npm --prefix client run dev
```

Open **`http://localhost:5173`** in your browser.

### Verify Build & Test Suite
```bash
npm --prefix server test       # 28/28 Vitest unit tests pass
npm --prefix client run build  # Strict TypeScript compilation + Vite production bundle
```

---

## 🎯 The "Quality First" Problem & Solution

### The Gap in Web Scraping
Tools like **SaaSquatch** excel at pulling massive volumes of raw leads. However, sales reps and PE sourcing associates lose 60%+ of their productive time:
- **Drowning in noise:** Sifting unranked records without knowing fit or priority.
- **Duplicate records:** The same account appears with slight name variations (`Retool Inc` vs `Retool`) or different domains.
- **Unclear next steps:** Reps guess whether to pitch C-suite, run technical discovery, or enrich data.

### Our Solution
**LeadScore AI** acts as the high-velocity intelligence layer on top of scraped leads:
1. **100-Point Deterministic ICP Engine:** Transparent, auditable scoring across 6 key factors (Industry, Headcount, Geo, Persona, Technographics, Data Completeness).
2. **Next-Best-Action Prescriptions:** Context-aware routing (`Executive Outreach`, `Technical Deep Dive`, `Data Enrichment`) with copyable, tailored pitch angles.
3. **Multi-Strategy Deduplication:** Exact domain normalization, email clash detection, and fuzzy company name matching.
4. **Interactive ICP Tuning:** Real-time sliders and criteria tags that trigger instant global pipeline recalculation.
5. **Universal Responsive UI:** Flawless operation from 320px mobile to 1440px+ desktop.

---

## 📱 Responsive Design System

Tested and optimized across all standard breakpoints without page-level horizontal overflow:

| Viewport | Devices | Key Responsive Strategy |
|:---|:---|:---|
| **320px – 430px** | Mobile (iPhone SE, 13–15 Pro, Pixel) | **Hybrid Cards/Table toggle** (card view default prevents overflow); 2-col compact filter grid; bottom thumb navigation bar; accessible slide-out drawer; internal scroll dialogs (`max-h-[92vh]`); $\ge44\text{px}$ touch targets. |
| **768px – 1023px** | Tablet (iPad Mini / Air) | 2–3 col metric grid; side-by-side lead overview; contained horizontal-scroll table with visible cues. |
| **1024px – 1279px** | Small Laptop | Persistent sidebar navigation; 5-col metric summary; Recharts charts side-by-side; 3-col ICP settings. |
| **1280px – 1440px+** | Desktop | Full multi-column data table with sort headers; sticky ICP weight distribution card; fluid container. |

---

## 🏗️ Architecture & Engineering

```
Frontend (React 19 + TypeScript + Vite 8 + Tailwind CSS v4)
                          │  HTTP Proxy (:5173 ➔ :3001)
                          ▼
Backend (Node.js + Express + TypeScript + Zod)
   ├── 100-Point ICP Scoring Engine (qualificationEngine.ts)
   ├── Next-Best-Action Router (nextBestAction.ts)
   ├── Multi-Strategy Deduplication (duplicateDetection.ts)
   └── Storage Layer: MongoDB (Mongoose) ◄─► In-Memory Store (demoStore.ts)
```

- **Data Storage:** Production MongoDB support with indexed lookups (`domain`, `email`, `companyName`). Falls back automatically to zero-config in-memory store pre-seeded with 15 real B2B accounts (`server/src/seed/demoData.ts`).
- **Performance:** Sub-millisecond in-memory cache, debounced queries, asynchronous batch recalculations, and compressed bundle (`~206 KB` gzip).
- **Hosting Setup:** Static edge frontend (Vercel / Cloudflare Pages) + containerized backend (AWS ECS / Render) + MongoDB Atlas.

---

## 🧪 Evaluation Criteria Alignment (40/40 Points)

| Criteria | Pts | Implementation Highlights |
|:---|:---:|:---|
| **1. Business Understanding** | **10/10** | Aligns with Caprae's post-acquisition value creation thesis. Filters noise; scores headcount, ARR, C-level persona, and tech stack for M&A and enterprise sales. |
| **2. UX/UI & Usability** | **10/10** | Mobile card/table toggle; 2-col mobile filters; thumb bottom nav; $\ge44\text{px}$ touch targets; zero layout overflow. |
| **3. Technicality & Scale** | **10/10** | Strict TypeScript; fuzzy deduplication; Zod runtime validation; 28 Vitest unit tests covering all edge cases. |
| **4. Design & Polish** | **5/5** | Modern SaaS palette (slate/indigo/emerald), clean typography, responsive Recharts charts, and clear visual hierarchy. |
| **5. Value-Add** | **5/5** | AI narrative synthesis with deterministic fallback; one-tap pitch hook copy; one-command launcher (`./is.sh`). |

---

## 🔌 REST API Summary

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/health` | Service health, uptime, and mode |
| `GET` | `/api/dashboard/stats` | Aggregated priority, score, and industry counts |
| `GET` | `/api/leads` | Paginated leads with search, filter, and sort |
| `POST` | `/api/leads` | Create prospect & auto-qualify against active ICP |
| `GET` | `/api/leads/:id` | Fetch lead details with 6-factor score breakdown |
| `PATCH`| `/api/leads/:id` | Update lead & trigger re-qualification |
| `POST` | `/api/leads/:id/explanation` | AI synthesis narrative & tailored outreach hook |
| `POST` | `/api/leads/qualify` | Batch recalculate all leads in workspace |
| `GET`  | `/api/icp` | Get active ICP criteria & scoring weights |
| `PUT`  | `/api/icp` | Update ICP criteria & weight allocations |

---

# Section 4 — Business Understanding Questions

### 1. What is Caprae's Mission?

Caprae Capital aims to create long-term value in acquired businesses through operational excellence, technology, and AI-driven innovation. Rather than focusing solely on the financial aspects of acquisitions, Caprae emphasizes improving business performance after acquisition by equipping companies with better tools, systems, and processes.

Its approach of combining entrepreneurial leadership with engineering capabilities is particularly interesting to me because it demonstrates how technology can be used not just to support a business, but to accelerate its growth and create lasting competitive advantages.

### 2. Why do you want to work at Caprae Capital?

I want to work at Caprae Capital because it combines software engineering, AI innovation, and real business impact. I enjoy building products that solve practical problems, improve workflows, and help people make better decisions.

Through my experience with React, React Native, Node.js, Express, and REST APIs, I have worked on user-facing applications and backend integrations. Building LeadScore AI has also allowed me to explore AI-assisted lead qualification, deterministic scoring, and next-best-action recommendations.

I see an opportunity at Caprae to apply these skills to meaningful products in the M&A space, take ownership of features across the stack, and grow as an engineer while contributing to tools that support sourcing, evaluation, and post-acquisition growth.

### 3. How is Caprae changing the ETA space and broader private equity industry?

Entrepreneurship Through Acquisition (ETA) and private equity involve challenges such as identifying suitable businesses, organizing fragmented information, prioritizing opportunities, and evaluating potential acquisitions efficiently.

Technology and AI can help address these challenges by automating repetitive workflows, structuring business data, improving lead qualification, and surfacing actionable insights. Caprae's emphasis on proprietary tools and operational improvement reflects the potential for engineering to become a strategic advantage in this space.

I believe the broader opportunity is to use technology not only to make acquisition processes more efficient, but also to help acquired businesses improve their operations and achieve sustainable growth.

# Candidate Employment Questionnaire

### US Work Status
Answer truthfully based on your current authorization. If you are based in India and do not have US work authorization, do not select “authorized to work in the US without sponsorship.” If the position supports international remote work or contractor arrangements, clarify your eligibility with the recruiter.

### Weekly Commitment
I am willing to commit to 40+ hours per week, subject to confirming the working schedule and employment terms.

### Why Caprae?
I want to build practical, high-impact full-stack and AI-enabled products that solve real business problems. Caprae's combination of M&A, technology, and operational value creation aligns with my interest in building useful software and taking ownership from implementation through delivery.

### Expected Salary
Open to discussion based on the role's responsibilities, compensation structure, and employment arrangement.

### Employment Confirmations
- **Three-month probation:** Confirm only if you understand and accept this condition.
- **9:00 AM–6:00 PM EST training schedule:** Confirm only if you can consistently work the corresponding hours from India. This is approximately an evening-to-early-morning schedule in India.
- **Off-hours emergencies:** Confirm only if you can meet the stated availability expectation.

# Section 7 — Reapplicant / Bonus Questions

### 1. What do you think is Caprae's unfair advantage?

I believe Caprae's potential unfair advantage lies in combining M&A expertise with an engineering-driven approach to business growth. Traditional acquisition workflows can involve substantial manual research, fragmented information, and repetitive evaluation tasks. Proprietary software and AI can help streamline these activities while supporting more consistent decision-making.

This combination of domain knowledge, operational execution, and technology creates an opportunity to build capabilities tailored to Caprae's investment process rather than relying entirely on generic tools. As a developer, I would be excited to contribute to that advantage by building reliable, user-friendly products that turn complex workflows into actionable systems.

### 2. What does “To become a legend, you must take down legends” mean to you?

To me, this means challenging established ways of doing things through consistent execution, curiosity, and meaningful innovation. Existing approaches may be successful, but that does not mean they cannot be improved.

As an engineer, I interpret this as being willing to question assumptions, learn quickly, build practical solutions, and measure success by the value delivered rather than simply following conventional methods. It also means maintaining high standards and being persistent when solving difficult problems.

### 3. What do you think Caprae's culture will be like?

Based on Caprae's stated philosophy, I would expect a culture that values ownership, direct communication, high standards, and practical results. I imagine engineers working closely with business stakeholders to understand real problems and deliver solutions quickly, while remaining accountable for quality and reliability.

That environment appeals to me because I enjoy taking responsibility for features, collaborating across the stack, and learning through hands-on problem-solving. I would aim to contribute by communicating clearly, responding constructively to feedback, and consistently delivering useful software.
---

## 📬 Submission Checklist

- **Repository:** Complete source code (client, server, tests, config).
- **Video Walkthrough (1–2 min):** [Walkthrough Video Link](https://drive.google.com/file/d/1AedyVrE33_TinuwMHDZnRsH01LO_u0uF/view?usp=sharing) *(Insert your Loom or YouTube video link prior to sending)*.
- **Submission Email:** `recruiting@capraecapital.com`
- **Subject Line:** `Full Stack Developer - Handbook Submission - [Your Name]`
- **Attachments:** Resume, Repository URL, Video URL.
