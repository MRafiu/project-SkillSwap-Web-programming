# SkillSwap — Campus Skill Exchange & Time Bank

A peer-to-peer barter network for trading skills instead of money across campus. 
Offer what you can teach (e.g. guitar, calculus, graphic design), request what you want to learn, 
and the application manages the exchange using time credits as a zero-inflation currency.

Built for **University CSE Web Programming Project**.

---

## Stack

| Layer | Choice |
|---|---|
| **Backend** | Node.js (v20+), Express.js (ES Modules), JWT (`jsonwebtoken`), `bcryptjs`, CORS |
| **Database** | MySQL 8.0 (Normalized Relational Schema, ACID Transactional Credit Transfers) |
| **Frontend** | React 19, React Router v7, Vite |
| **Styling** | Tailwind CSS v3 with custom semantic theme tokens and Lucide React icons |
| **Architecture**| Decoupled RESTful API with Bearer token authentication and Role-Based Access Control |

The frontend and backend run as independent services. The React single-page application makes asynchronous
JSON requests to the Express REST API via an Axios-configured HTTP client (`src/api/apiClient.js`) 
with automatic JWT authorization header injection.

---

## Features

### For students (Learners & Mentors)

| Feature | Description |
|---|---|
| **Post a skill** | Create listings detailing skills you can teach, category, proficiency level, and description. |
| **Skills wishlist** | Mark skills you want to acquire; the system matches your wishlist against available mentor listings. |
| **Browse & Filter** | Keyword search across skills, bios, and categories with live filtering by mentor rating and weekly availability. Filter states are preserved. |
| **Availability Matrix** | Interactive weekly calendar slot picker where mentors define free hours and learners book matching slots without scheduling conflicts. |
| **Direct messaging** | Built-in chat channel on every proposed trade so both students can agree on syllabus, location, and prerequisites before confirming. |
| **Atomic time banking** | 1 hour of instruction = 1 Time Credit. Balance settles only after session completion via atomic MySQL transactions (`START TRANSACTION`, `COMMIT`, `ROLLBACK`). |
| **Reliability algorithm** | A quiet trust score (0–100%) that tracks attendance and responsiveness. Ghosting a session lowers the score; falling below threshold temporarily locks new trade requests. |
| **Post-session reviews** | 1–5 star ratings and written feedback left after completed trades, contributing to the mentor's public reputation. |
| **Milestone badges** | Automatically awarded badges (*First Swap*, *10 Trades Completed*, *Top-Rated Mentor*) that display on the user's public profile. |
| **Achievement certificate**| Dynamic certificate viewer modal rendered upon milestones to validate skills learned through campus bartering. |
| **Monthly leaderboard** | Real-time board featuring the most active learners and highest-rated teachers of the month. |
| **Public profile** | Showcase bio, offered skills, wishlist, verified reviews, total hours traded, reliability badge, and trade history. |

---

### For administrators — `/admin`

A dedicated management portal with role-based route guardrails (`AdminProtectedRoute.jsx`):
- **Platform health at a glance:** Live metrics for total registered students, active listings, total credit hours exchanged, and open dispute tickets.
- **Dispute resolution desk:** Review evidence, timestamps, and chat transcripts when two students disagree on whether a session occurred; admins can execute atomic credit reversals.
- **User & listing moderation:** Suspend abusive accounts, restore throttled reliability scores, and unpublish inappropriate skill listings.
- **System analytics:** Transaction velocity and category demand charts.

---

## Status & Trade Lifecycle

```
[REQUESTED] ──Teacher Accepts──> [SCHEDULED] ──Both Attend & Complete──> [COMPLETED]
     │                                                                          │
     ├──Teacher Declines / Cancelled                                            ▼
     ▼                                                               [Atomic Credit Transfer]
[CANCELLED]                                                                     │
     │                                                                          ▼
[0 Balance Delta]                                                   [Review & Ratings Posted]
```

### Dispute Flow
```
[SCHEDULED] ──No-show / Disagreement──> [DISPUTED] ──Admin Reviews Evidence──> [RESOLVED / REVERSED]
```

A trade remains pending until both parties confirm completion. If a dispute is raised,
the disputed credits are locked until administrator review, preventing credit fabrication or fraudulent claims.

---

## Running it locally

### Prerequisites
- **Node.js**: v18.0.0 or newer
- **MySQL**: 8.0+ or XAMPP (Apache + MySQL)

### 1. Database setup
Create the database in your local MySQL instance:
```sql
CREATE DATABASE IF NOT EXISTS skill_swap CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Import the database schema and sample seed records from the project root:
```bash
mysql -u root -p skill_swap < skill_swap.sql
mysql -u root -p skill_swap < seed_query.sql
```
*Note: If using XAMPP phpMyAdmin, import `skill_swap.sql` first, followed by `seed_query.sql`.*

### 2. Backend configuration
Create a `.env` file inside `skillswap-backend/`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=skill_swap
JWT_SECRET=skillswap_super_secret_jwt_key_2026
```

### 3. Start the application

**Option A: Windows 1-Click Runner**
```cmd
start-app.bat
```

**Option B: Terminal (from project root)**
```bash
npm run dev
```

Then open your browser:
- **Frontend SPA:** <http://localhost:5173>
- **Backend API:** <http://localhost:5000>

---

## Project Layout

```
project-SkillSwap-Web-programming/
├── package.json                 # Root script orchestration (concurrent frontend & backend)
├── dev.js                       # Cross-platform development runner
├── start-app.bat                # Windows native startup script
├── skill_swap.sql               # Normalized MySQL schema DDL
├── seed_query.sql               # Seed accounts, mock skills, and demo trades
│
├── skillswap-backend/           # Node.js & Express REST API
│   ├── package.json
│   └── src/
│       ├── server.js            # Express server initialization & middleware
│       ├── config/
│       │   └── db.js            # MySQL2 connection pooling with promise support
│       ├── middleware/
│       │   └── authMiddleware.js# JWT verification and Admin RBAC enforcement
│       └── routes/
│           ├── authRoutes.js        # Login, registration, profile retrieval
│           ├── skillRoutes.js       # CRUD listings, category filters, wishlist
│           ├── sessionRoutes.js     # Trade requests, state transitions, scheduling
│           ├── creditRoutes.js      # Atomic wallet transfers & transaction history
│           ├── availabilityRoutes.js# Weekly mentor slot management
│           ├── messageRoutes.js     # Pre-trade chat messaging
│           ├── reviewRoutes.js      # Post-session ratings and feedback
│           ├── leaderboardRoutes.js # Monthly ranking aggregation
│           ├── certificateRoutes.js # Milestone certification generation
│           ├── disputeRoutes.js     # User dispute reporting
│           ├── adminRoutes.js       # Admin oversight, moderation, reversals
│           └── userRoutes.js        # Public & private profile management
│
└── skillswap-frontend/          # React Single Page Application (Vite)
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx             # React DOM root
        ├── App.jsx              # Route definitions & layout wrappers
        ├── api/
        │   └── apiClient.js     # Axios client with JWT request interceptor
        ├── context/
        │   └── AuthContext.jsx  # Global session state & credit balance sync
        ├── components/
        │   ├── layout/          # Navbar, Footer
        │   ├── common/          # Button, Badge, CalendarAvailabilityPicker
        │   ├── cards/           # SkillCard, ReviewCard, StatCard
        │   ├── landing/         # HeroSection, HowItWorks, Testimonials
        │   ├── CertificateModal.jsx
        │   ├── ProtectedRoute.jsx
        │   └── AdminProtectedRoute.jsx
        └── pages/
            ├── Landing.jsx          # Public landing page
            ├── BrowseSkills.jsx     # Searchable directory with filters
            ├── PostSkill.jsx        # Create / edit skill listings
            ├── Schedule.jsx         # Calendar slot selector
            ├── Requests.jsx         # Trade invitations & approvals
            ├── Messages.jsx         # In-app chat interface
            ├── Dashboard.jsx        # Student hub & credit ledger
            ├── Profile.jsx          # Personal profile editor
            ├── PublicProfile.jsx    # Sharable mentor portfolio
            ├── Leaderboard.jsx      # Top contributors
            └── admin/               # Admin dashboard, Disputes, Users, Analytics
```

---

## API Specification

All endpoints communicate via JSON and require Bearer Token authorization unless marked public.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Create new student account (grants initial seed credit) |
| `POST` | `/api/auth/login` | Public | Authenticate user & return signed JWT |
| `GET` | `/api/users/profile` | Authenticated | Fetch current user session, wallet balance, and stats |
| `GET` | `/api/users/:id/public` | Public | Fetch public profile, reviews, and badges |
| `GET` | `/api/skills` | Public | Browse skills with query filters (`category`, `search`, `minRating`) |
| `POST` | `/api/skills` | Authenticated | Publish a new skill listing |
| `GET` | `/api/availability/:userId` | Authenticated | Retrieve a mentor's active calendar slots |
| `POST` | `/api/sessions/request` | Authenticated | Submit a session booking request for a time slot |
| `PUT` | `/api/sessions/:id/accept` | Mentor | Accept session & move trade status to `SCHEDULED` |
| `POST` | `/api/sessions/:id/complete`| Participants | Confirm session delivery; triggers atomic credit transfer |
| `GET` | `/api/credits/history` | Authenticated | View ledger of past credit earnings and expenditures |
| `GET` | `/api/messages/:sessionId` | Participants | Load pre-trade chat log |
| `POST` | `/api/messages` | Participants | Send message in trade thread |
| `POST` | `/api/reviews` | Authenticated | Submit 1–5 star rating and comment after trade |
| `GET` | `/api/leaderboard` | Public | Monthly top teachers and learners |
| `POST` | `/api/disputes` | Authenticated | Open dispute ticket on an unfulfilled session |
| `GET` | `/api/admin/metrics` | Admin | Aggregate KPI dashboard metrics |
| `POST` | `/api/admin/disputes/:id/resolve` | Admin | Settle dispute and execute credit rollback if warranted |

---

## Design Decisions

### 1. Closed-Loop Time Banking Economy
Cash transactions create power imbalances and exclude students with limited budgets. 
SkillSwap treats time as an absolute equalizer: one hour of tutoring in Web Development yields exactly one credit, 
which can be spent on one hour of Spanish or Graphic Design. 
The currency supply expands only when new members join (seed credit) and circulates strictly through mutual contribution.

### 2. ACID Transactional Integrity
Credit transfers are the single most vulnerable operation in a barter network. 
If a network blip occurs after debiting the learner but before crediting the teacher, 
credits vanish. All balance settlements are wrapped inside database transactions:
```sql
START TRANSACTION;
UPDATE users SET credits = credits - 1 WHERE id = learner_id AND credits >= 1;
UPDATE users SET credits = credits + 1 WHERE id = teacher_id;
INSERT INTO credit_ledger (sender_id, receiver_id, amount, session_id) VALUES (...);
COMMIT;
```
If the learner has insufficient credits or any statement fails, the entire transaction issues a `ROLLBACK`, eliminating race conditions and double-spending.

### 3. Anti-Ghosting Reliability Algorithm
Peer learning networks fail when participants book slots and fail to show up. Rather than banning users immediately, 
SkillSwap calculates an automated reliability ratio:$$\text{Reliability Score} = \left(\frac{\text{Sessions Completed as Scheduled}}
{\text{Total Sessions Confirmed}}\right) \times 100$$Unexcused absences and cancellations within 2 hours drop the score. 
Accounts falling below 60% are restricted from booking new trades until they complete an administrative check-in or rebuild trust through peer vouches.

### 4. Four Explicit UI States
Every view across the frontend strictly handles four visual states: **Initial/Data**, **Loading Skeleton**, 
**Empty State** (with clear Call-to-Action), and **Error State** (with retry buttons). 
A slow connection or an empty category never presents a blank or broken screen.

### 5. Independent Component Hierarchy & Protected Navigation
The frontend uses route wrappers (`ProtectedRoute.jsx` and `AdminProtectedRoute.jsx`) that 
evaluate authentication state in memory before component mounting. 
Unauthorized access attempts to `/admin` redirect cleanly without flashing privileged layouts.

---

## 👥 Team & Contributors
> **Department of Computer Science & Engineering (CSE)**

| Name | Student ID | Core Contribution | GitHub Profile |
|---|:---:|---|:---:|
| **MD Adnan Hossain** | [0112430192] | Full-Stack Architecture, Database & Integration | [@mdadnanhossainrafiu](https://github.com/mdadnanhossainrafiu) |
| **[Team Member 2]** | [ID] | Frontend UI/UX, Component Library & Styling | [@member2](https://github.com/) |
| **[Team Member 3]** | [ID] | Backend REST APIs, JWT Auth & Transactions | [@member3](https://github.com/) |
| **[Team Member 4]** | [ID] | Database Schema DDL, Seeding & QA Testing | [@member4](https://github.com/) |

---

## Browser Support
Tested and fully supported on modern releases of **Google Chrome**, **Mozilla Firefox**, **Microsoft Edge**, and **Safari**. 
Built using native CSS custom properties, modern Flexbox/Grid, and responsive media queries.

---

## License
Developed as an academic university group project for educational and demonstration purposes.
