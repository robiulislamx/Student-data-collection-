export const TECHNICAL_DOCS = `
# Enterprise Student Information Management System (SIMS)
## High-Performance SaaS Blueprint & Architectural Manual

---

### 1. Complete System Architecture

SIMS incorporates a secure, tiered full-stack design optimized for low-latency performance, scalability, and strict security compliance.

\`\`\`
   ┌────────────────────────────────────────────────────────┐
   │                  Presentation Layer                    │
   │   - Modern React with SPA Router                       │
   │   - Premium Tailwind Style Tokens                      │
   │   - Interactive Recharts Business Analytics Dashboard  │
   └───────────┬────────────────────────────────┬───────────┘
               │ Secure HTTPS                   │ Secure HTTPS
               ▼                                ▼
   ┌────────────────────────────────────────────────────────┐
   │                    Application API                     │
   │  - Express REST Layer                                  │
   │  - Middlewares: Spam Guard, Rate Limiter               │
   │  - Secure Encryption & Strict Duplicate Detection Logic │
   └───────────┬────────────────────────────────┬───────────┘
               │ Internal Engine                │ OAuth 2.0 Webhooks
               ▼                                ▼
   ┌────────────────────────────────┐ ┌─────────────────────┐
   │       Persistence Engine       │ │ Third-Party Gateway │
   │  - PostgreSQL / Supabase       │ │ - Google Sheets API │
   │  - Real-Time Database Client   │ │ - Gmail SMTP Notif  │
   └────────────────────────────────┘ └─────────────────────┘
\`\`\`

- **Presentation Layer**: Optimized using Vite and tailwindcss v4. Component loading is split dynamically to avoid large bundles. Animated transition states are powered by Framer/Motion.
- **Application Logic Server**: Decoupled Express API routes proxying secret external integrations keeps API Keys protected from Client-Side exposure.
- **Data Tier**: Combines transactional storage (Supabase/PostgreSQL) with a real-time Bidirectional Google Sheets Sync worker.

---

### 2. Database ER Diagram & State

SIMS implements a highly normalized schema with secondary composite indexing on Student Submissions to yield maximum duplicate prevention speed:

\`\`\`
   +──────────────────────────────────+
   |              USERS               |
   +──────────────────────────────────+
   | id          : UUID (PK)         |
   | role        : VARCHAR(20)        |
   | email       : VARCHAR(100) (UQ) |
   | password    : VARCHAR(255)      |
   | name        : VARCHAR(100)      |
   +──────────────────────────────────+
                 | 1
                 |
                 | 0..*
   +──────────────────────────────────+
   |          APPROVAL_LOGS           |
   +──────────────────────────────────+
   | id          : UUID (PK)         |
   | student_id  : VARCHAR(50) (FK)  |
   | action      : VARCHAR(20)        |
   | reason      : TEXT (Nullable)   |
   | admin_email : VARCHAR(100)      |
   | timestamp   : TIMESTAMP         |
   +──────────────────────────────────+
                 |
                 | 0..* (Tracks State Decision)
                 |
   +──────────────────────────────────+
   |             STUDENTS             |
   +──────────────────────────────────+
   | id          : UUID (PK)         |
   | student_id  : VARCHAR(50) (UQ)  | <--- INDEXED (Composite)
   | full_name   : VARCHAR(150)      |
   | email       : VARCHAR(150) (UQ) | <--- INDEXED (Composite)
   | mobile      : VARCHAR(25)  (UQ) | <--- INDEXED (Composite)
   | status      : VARCHAR(20)       |
   | is_synced   : BOOLEAN           |
   | records_doc : JSONB             | <--- Personal, Academic, Address, Dynamic Fields
   | created_at  : TIMESTAMP         |
   +──────────────────────────────────+
                 | 1
                 |
                 | 0..*
   +──────────────────────────────────+
   |       NOTIFICATIONS_SMTP         |
   +──────────────────────────────────+
   | id          : UUID (PK)         |
   | recipient   : VARCHAR(100)      |
   | type        : VARCHAR(50)       |
   | payload     : TEXT              |
   | status      : VARCHAR(15)       |
   | timestamp   : TIMESTAMP         |
   +──────────────────────────────────+
\`\`\`

---

### 3. REST API Architecture

Strict payload modeling enforces clean transactional routes, safeguarding state changes:

| Method | Endpoint | Authorized Roles | Functional Objective |
| :--- | :--- | :--- | :--- |
| **GET** | \`/api/db\` | Guest / Admin | Fetch full active operational and settings states |
| **POST** | \`/api/register\` | Public Guest | Creates pending registration. Evaluates Duplicate Prevention engine |
| **POST** | \`/api/approve\` | Admin | Confirms student credentials, updates Sheet and triggers Gmail |
| **POST** | \`/api/reject\` | Admin | Sets status, appends rejection reason text, triggers alerting email |
| **POST** | \`/api/fields/add\` | Admin | Appends a dynamic field to the builder configuration and form |
| **POST** | \`/api/fields/delete\`| Admin | Drops a dynamic field from schema templates |
| **POST** | \`/api/settings/update\`| Admin | Alters OAuth endpoints, admin notifications, and Sync switches |

---

### 4. Application Folder Structure

Modular system separation for rapid scaling and future milti-tenant expansions:

\`\`\`
├── data/
│   └── db.json                    # Flat persistent Local File Database
├── src/
│   ├── components/
│   │   ├── AdminDashboard.tsx     # Admin metric visualizers & search dashboards
│   │   ├── AdminLogin.tsx         # Secure JWT identity gates
│   │   ├── DynamicFormBuilder.tsx # Dynamic layout editor
│   │   ├── StudentPortal.tsx      # Student submission form & dynamic renderer
│   │   └── StatusDesk.tsx         # Real-time search/updates desk
│   ├── App.tsx                    # Main portal route-controller
│   ├── docs.ts                    # Technical documentation corpus (This spec wiki)
│   ├── index.css                  # Tailwind v4 globals & custom font tokens
│   ├── main.tsx                   # StrictMode React entry configuration
│   └── types.ts                   # Unified Type interface declarations
├── server.ts                      # Custom Express Backend & Proxy Node API
├── package.json                   # Dependency list & dev commands
└── tsconfig.json                  # Compiler boundaries
\`\`\`

---

### 5. Supabase & PostgreSQL DDL Schema

Execution script for bootstrapping production SQL instances in PostgreSQL:

\`\`\`sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: Users (Admins)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'student')),
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: Students (Submissions)
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  mobile VARCHAR(25) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  institution VARCHAR(150) NOT NULL,
  department VARCHAR(100) NOT NULL,
  raw_payload JSONB NOT NULL, -- Dynamic and custom fields JSON schema
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CREATE INDEX FOR RAPID CONFLICT CHECKS
CREATE UNIQUE INDEX idx_students_duplicate_prevention 
ON students (student_id, email, mobile);

-- Table: Approval Logs
CREATE TABLE approval_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id VARCHAR(50) NOT NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('Approve', 'Reject')),
  reason TEXT,
  admin_id UUID REFERENCES users(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

---

### 6. Bidirectional Google Sheets Workflow

Allows real-time spreadsheet-based administrative edits to synchronize live with the Core Database:

\`\`\`
   [Student Submission]
           │
           ▼
     [Express Api] ────(Sync Node)────► [Google Sheets API V4 Wrapper]
                                              │ Check Auth Scope
                                              ▼
                                      [AppendRow Spreadsheet]
                                              │
                                              ▼
                                    [Spreadsheet Webhook URL]
                                              │ Change Triggered
                                              ▼
     [Express Api] ◀───(Update Db)──── [Express Webhook Listener]
\`\`\`

- **Sheet Config**: Instantiates standard Google Sheets REST Client using key files.
- **Append**: Instantly maps dynamic JSON form arrays to flat columns on registration approval.
- **Webhook Integration**: Implements sheets Apps Script trigger (\`onChange\` / \`onEdit\`) to verify changed statuses and update database states if they are edited manually directly inside Google Sheets.

---

### 7. SMTP & Gmail Notification Sequence

Guarantees instantaneous alert deliverability on key lifecycle events:

\`\`\`
   +────────────────────────────+
   | Student Registration Event |
   +────────────────────────────+
                 │
                 ├─► [LOG Entry Saved]
                 │
                 ▼
   +────────────────────────────+
   |   Admin Notification SMTP  |
   +────────────────────────────+
   | Subject: SIMS Alarm        |
   | Body: Student Registration |
   +────────────────────────────+
                 │ Approval Decisions
                 ▼
   +────────────────────────────+
   |   Student Alert Sequences  |
   +────────────────────────────+
   | - Approved: Welcoming body |
   | - Rejected: Reason body    |
   +────────────────────────────+
\`\`\`

- **Admin Alarm**: Dispatches mail immediately to \`allisonburgee@gmail.com\` with formatted student ID, target division, and institution metadata.
- **Student Alert**: On positive confirmation, welcome emails map automated certificates or roster codes. On rejection, personalized reasons trigger to request edit updates.

---

### 8. Strict Enterprise Security Protocols

Deep security architecture checks are baked directly into the active compiler logic:

1. **Duplicate Prevention Engine**: Checks composite strings of Student ID, Email, and Mobile keys. Throws detailed 409 payloads blocking spam registrations.
2. **Bot Abatement Shields**: Standard Math Puzzle verification filters browser bot interactions. Automated spam detection labels potential spam submissions.
3. **Cross-Site Scripting (XSS) Filter**: Express sanitizers clean input payloads. React context binds values purely to state trees, bypassing hazardous browser execution.
4. **JWT Cryptographic Signatures**: Standard SHA-256 tokens authenticate subsequent admin headers, preventing session hijacking.
5. **Security Logging Engine**: Persistent security, audit, and operational logs can NEVER be deleted by standard client-side actors, establishing safe forensic trails.

---

### 9. Interactive Dashboard Metrics

Visual layouts align business statistics in simple, scannable widgets:

- **Bento Counter Grid**: Displays Total Submissions, Pending Registries, Approved Cohorts, and Rejected Applications.
- **Divided Visual Reports**: Live visual charts mapping submissions by daily volume, Institution categories, and departmental classifications.

---

### 10. Core Development Roadmap

1. **Sprint 1 (Foundations)**: Types declaration, secure SQLite/JSON flat file persistent seeding, Express API routes config, and base schema implementation.
2. **Sprint 2 (Form Construction)**: Fully responsive Student Portal interface, custom dynamic form field builders, and dynamic input validator blocks.
3. **Sprint 3 (Admin Central)**: Beautiful search dashboards, state update approval nodes, email and spreadsheet mock visualizers, and audit log portals.
4. **Sprint 4 (Testing & Harden)**: Integration tests, math captcha validation, rate limiter settings, secure document storage mapping.

---

### 11. Production Deployment Action Plan

1. **Cloud Run Inbound setup**: Deploy Docker-contained Express Node Server specifying port 3000 ingress.
2. **Secrets Inject**: Populate \`GEMINI_API_KEY\` and Google Service Account credential strings securely on runtime controls.
3. **Domain Mapping**: Map SSL certificates to custom corporate domains, enabling cloud DNS protections for Bangladesh-based institutions.

---

### 12. Future Scalability Blueprint

- **Multi-Tenant Routing**: Dynamically scopes sub-domain indexes (e.g. \`du.sims.gov.bd\`) to filter institution logs securely.
- **Database Scaling**: Transitions fast file storage records onto CockroachDB / Spanner nodes to support up to 5,000 requests/sec.
- **AI Processing Layer**: Plugs Gemini models directly into submission flows to perform offline matching of profile photos with passport IDs.
`;
