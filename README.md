LeadScore AI
AI-Assisted Lead Qualification & Next-Best-Action Workspace
LeadScore AI is a lead-management workspace that helps sales teams
prioritize prospects, understand why a lead fits their target customer
profile, and decide what action to take next. It combines configurable
Ideal Customer Profile (ICP) criteria, deterministic lead scoring,
next-best-action recommendations, duplicate checks, and an AI-assisted
explanation layer.
Built for the Caprae Capital Full Stack Developer AI-Readiness
Pre-Screening Challenge.
Problem and approach
Sales teams can waste time reviewing large lead lists, following up with
poor-fit prospects, and manually deciding which lead deserves attention.
LeadScore AI brings lead review, qualification, explanations, and
follow-up recommendations into one workspace.
The design focuses on: 1. Consistent prioritization: weighted
business rules calculate a repeatable score. 2. Explainability:
users can understand the factors behind a score. 3. Actionability:
recommendations help users decide whether to contact, verify, or enrich
a lead.
This application is a qualification and workflow-assistance tool. It
does not claim to scrape websites automatically or independently verify
every lead attribute.
Features
- Dashboard statistics, priority distribution, and industry breakdown.
- Lead search, filtering, sorting, and pagination.
- Lead creation, editing, details, and status management.
- Explainable qualification score out of 100.
- Next-best-action recommendations based on score and available data.
- AI-assisted explanation with a deterministic fallback.
- Configurable ICP criteria and scoring weights.
- Batch requalification when ICP settings change.
- Normalization-based duplicate detection.
- Backend input validation using Zod.
Lead qualification logic
The qualification engine uses six weighted factors:
  Factor                   Weight
  Industry fit                 25
  Company size                 20
  Location fit                 15
  Decision-maker role          15
  Technology fit               15
  Data completeness            10
  Total               100
Priority thresholds:
  Score      Priority
  75--100    High
  45--74     Moderate
  Below 45   Low
Weights can be configured through ICP settings, with validation that the
total equals 100. The numeric score is calculated by deterministic
business rules, so the same lead and ICP configuration produce a
consistent result. Missing information should be treated as uncertainty
rather than automatically being treated as proof of poor fit.
AI explanation layer
The AI explanation service uses a configured Gemini-compatible API
endpoint and requests structured fields such as explanation,
topReason, nextAction, and justification.
The service includes timeout and HTTP/response checks, output
validation, and rate limiting. If the AI service is unavailable or its
response is unusable, the application can fall back to a deterministic
explanation.
Important: AI explains qualification results; it does not calculate
the numeric score. This keeps core business logic predictable and
auditable.
Duplicate detection
The duplicate workflow normalizes values such as company domains, email
addresses, and company names. Exact normalized domain or email matches
can be treated as confirmed matches, while normalized company-name
matches can be flagged as potential duplicates for review. This is
normalization-based detection, not fuzzy or approximate-string matching.
Technology stack
  Layer                         Technology
  Frontend                      React, TypeScript, Vite
  Backend                       Node.js, Express, TypeScript
  API                           REST
  Validation                    Zod
  Persistent database support   MongoDB with Mongoose
  Local/demo storage            Seeded in-memory demo store
  AI explanation                Configurable Gemini-compatible API endpoint
Exact package versions and available scripts are defined in
client/package.json and server/package.json.
Architecture
LeadScoreAI/
├── client/
│   ├── src/
│   │   ├── features/
│   │   │   └── icp/
│   │   └── lib/
│   │       └── api.ts
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── validators/
│   │   └── index.ts
│   └── package.json
└── README.md
This is a high-level map of key areas; the repository may contain
additional files.
Request flow
1. The React client sends a request through its central API helper.
2. The Express REST API routes the request to the relevant controller.
3. Controllers coordinate validation and service calls.
4. Services implement scoring, next-best-action recommendations,
   duplicate checks, and AI explanations.
5. The application uses MongoDB when configured, or the in-memory demo
   store in demo mode.
6. The API response is displayed in the frontend.
Data storage and demo mode
The backend supports MongoDB persistence through Mongoose when a MongoDB
connection string is configured. If MongoDB is not configured or a
connection fails, the application can use seeded in-memory demo data.
Demo-mode limitation: changes held in memory are lost when the
server restarts. For persistent deployment, configure MongoDB (for
example, MongoDB Atlas), use a dedicated database user, restrict network
access, and test persistence by restarting the server.
Performance and reliability
Current reliability measures include centralized frontend API calls,
separation of controllers and services, Zod validation, AI
timeout/response checks, fallback explanations, and list navigation
features such as search, filtering, sorting, and pagination.
The current lead-list flow performs pagination in the application layer
after loading leads. For larger datasets, move filtering, sorting,
pagination, and dashboard aggregations into MongoDB queries and add
indexes based on measured query patterns (for example, normalized
domain, email, status, industry, or score).
No dedicated distributed cache is assumed. If usage grows, measure
latency first and consider caching frequently read ICP settings or
dashboard aggregates, with explicit invalidation whenever relevant lead
data or ICP settings change.
Getting started
Prerequisites
- Node.js and npm compatible with the package files.
- Git.
- MongoDB, optional for demo mode but recommended for persistence.
- An AI API key and endpoint, optional if using fallback explanations.
Clone the repository
git clone https://github.com/IshaNITM/LeadScoreAI.git
cd LeadScoreAI
Install dependencies
In one terminal:
cd client
npm install
In another terminal from the repository root:
cd server
npm install
Configure environment variables
Create a local .env file under server/ using only the variable names
supported by server/src/config/index.ts. Common configuration names in
this project include:
  Variable                            Purpose
  PORT                              Backend port, if supported
  MONGODB_URI                       MongoDB connection string, if
                                      supported under this name
  AI_API_URL                        Configured AI endpoint
  AI_API_KEY                        AI API key
  GEMINI_API_KEY                    Alternative AI key variable
                                  supported by the configuration
Check server/src/config/index.ts for the exact names, required values,
and defaults before running or deploying. Do not commit .env files or
real credentials. Keep AI keys on the server, never in frontend code.
Illustrative local values only (verify names against the configuration):
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/leadscoreai
AI_API_URL=YOUR_CONFIGURED_AI_ENDPOINT
AI_API_KEY=YOUR_SECRET_KEY
Run the application
Start the client:
cd client
npm run dev
Start the backend in a second terminal using the development script
defined in server/package.json (commonly npm run dev). The package
scripts are the source of truth; if a script differs, use the script
actually listed there.
Open the local URL printed by Vite. Check the backend output for the
listening port and whether it is using MongoDB or demo mode.
Smoke-test checklist
1. Confirm the dashboard statistics and leads load.
2. Search for a lead and use filters, sorting, and pagination.
3. Open a lead and review its score, priority, factors, and next-best
   action.
4. Create a valid lead and confirm it appears in the list.
5. Edit a lead and check whether qualification updates as expected.
6. Submit invalid inputs and verify controlled validation errors.
7. Test ICP validation, including invalid employee ranges and weights
   that do not total 100.
8. Save valid ICP settings and verify requalification.
9. Test duplicate detection using a repeated normalized email/domain.
10. Test AI explanations with valid configuration and test the fallback
    when AI is unavailable.
11. With MongoDB enabled, restart the server and verify saved data
    persists.
Run the lint, test, and build scripts that are actually present in the
package files. Do not report a test as passing unless it has been run.
API overview
The backend exposes REST endpoints through Express. Core workflows
include listing and browsing leads, creating and updating leads,
qualification and requalification, next-best-action recommendations, AI
explanations, ICP configuration, and duplicate checks.
For exact endpoint paths and request schemas, inspect the route
definitions and validators under server/src/. Route definitions in the
repository are the authoritative reference.
Deployment
The application can be deployed as a separate frontend, backend, and
database.
Suggested hosting layout: - Frontend: Vercel or another static host
for the Vite build. - Backend: Render or another Node.js application
host. - Database: MongoDB Atlas for persistence. - AI: provider
corresponding to the configured endpoint.
These are recommendations, not a claim that the app is already deployed.
Frontend deployment
1. Import the GitHub repository into the hosting provider.
2. Set the project root to client.
3. Use the build command defined in client/package.json (commonly
   npm run build).
4. For a standard Vite build, the output directory is dist.
5. Configure the API base URL using the variable supported by
   client/src/lib/api.ts.
6. Configure backend CORS to allow the deployed frontend origin, if
   applicable.
7. Test the deployed frontend against the deployed backend.
Backend deployment
1. Create a Node.js web service from the repository.
2. Set the root directory to server.
3. Configure install, build, and start commands using
   server/package.json.
4. Add required database and AI variables in the hosting dashboard.
5. Configure and test a health-check endpoint if the host requires one.
6. Restrict CORS to trusted origins where appropriate.
7. Review logs and test the API end to end.
In this suggested setup, the frontend host serves static assets, the
backend host runs Express, MongoDB Atlas provides persistence, and the
AI provider handles explanation requests. State the actual cloud
provider and live URLs in the submission only after deployment is
complete.
Security notes
- Keep .env, .env.*, database credentials, and API keys out of
  Git.
- Commit an .env.example with placeholders only if useful.
- Revoke or rotate any credential exposed in a commit or push attempt.
- Validate user input on the backend.
- Use least-privilege database credentials and restrict database
  network access.
- Never expose AI secrets in Vite/client-side variables.
- Review rate limits, request-size limits, CORS, error responses,
  logging, and data retention before production use.
Future improvements
- Move list filtering, sorting, pagination, and aggregates into
  database queries.
- Add tests for scoring boundaries, missing data, duplicate
  normalization, ICP validation, and AI fallback.
- Add observability for API latency, AI errors, and qualification
  outcomes.
- Add import/export and carefully scoped CRM integrations.
- Add external enrichment with clear source attribution.
- Add approximate-string duplicate matching only if needed, with
  transparent thresholds and human review.
- Add authentication and role-based access controls for multi-user
  production use.
- Use a background queue for expensive batch requalification at larger
  scale.
Assignment submission checklist
The Caprae Capital handbook asks for a GitHub repository containing the
relevant code and a README with setup instructions, plus a 1--2 minute
video explaining the project, business value, decisions, and results. A
demo link is optional but recommended.
- [ ] Confirm the repository contains only project files.
- [ ] Verify no .env files or credentials are committed.
- [ ] Test setup from a clean clone.
- [ ] Test dashboard, qualification, ICP, duplicates, and AI fallback.
- [ ] Run available production build and tests.
- [ ] Deploy and verify the app if feasible; add real URLs once ready.
- [ ] Record a concise walkthrough focused on business value and
  technical choices.
- [ ] Include an up-to-date resume in the submission email.
Author
Isha Pal
Project: LeadScore AI --- AI-Assisted Lead Qualification &
Next-Best-Action Workspace
Repository: https://github.com/IshaNITM/LeadScoreAI
