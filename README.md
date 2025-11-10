# Jia Web Application

Jia is a web application built with Next.js that appears to provide interview assistance, opportunity management, and communication tools. This README provides comprehensive information about the project, how to set it up, run it, and deploy it.

## Tech Stack

- **Frontend**:

  - Next.js 15.x (with App Router)
  - React 19.x
  - SASS for styling
  - TypeScript

- **Backend**:

  - Next.js API Routes (serverless functions)
  - MongoDB for database
  - Firebase for authentication and storage

- **APIs & Services**:

  - OpenAI API integration
  - Socket.io for real-time communication

- **DevOps**:
  - Vercel for deployment
  - Git for version control

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- MongoDB account (for database connection)
- Firebase account (for authentication)
- OpenAI API key

## Getting Started

### Setting Up Environment Variables

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Fill in the required environment variables in `.env`:

```
# OpenAI
OPENAI_API_KEY=your_openai_api_key

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Firebase
FIREBASE_SERVICE_ACCOUNT=your_firebase_service_account_json

# App Configuration
NEXT_PUBLIC_CORE_API_URL=your_backend_api_url
```

### Installing Dependencies

Using npm:

```bash
npm install
```

Using yarn:

```bash
yarn install
```

### Running Locally

Development mode with hot reloading (using Turbopack):

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`.

### Building for Production

```bash
npm run build
# or
yarn build
```

### Starting Production Server

```bash
npm run start
# or
yarn start
```

### Additional Scripts

Clean project (removes node_modules, .next, bun.lock, next-env.d.ts):

```bash
npm run clean
# or
yarn clean
```

## Project Structure

```
jia-web-app/
├── .env                 # Environment variables
├── .env.example         # Example environment configuration
├── .gitignore           # Git ignore file
├── next-env.d.ts        # TypeScript declarations for Next.js
├── package.json         # Project dependencies and scripts
├── public/              # Static assets
├── src/                 # Source code
│   ├── app/             # Next.js App Router structure
│   │   ├── api/         # API routes
│   │   ├── dashboard/   # Dashboard page
│   │   ├── interview/   # Interview related pages
│   │   ├── login/       # Authentication pages
│   │   ├── my-interviews/ # User interviews management
│   │   ├── applicant/ # Applicant tracking
│   │   ├── talk/        # Communication features
│   │   ├── layout.tsx   # Root layout
│   │   └── page.tsx     # Home page
│   ├── contexts/        # React contexts
│   └── lib/             # Shared libraries and utilities
│       ├── components/  # Reusable UI components
│       ├── context/     # Context providers
│       ├── firebase/    # Firebase configuration
│       ├── mongoDB/     # MongoDB utilities
│       ├── styles/      # Global styles
│       ├── Modal/       # Modal components
│       ├── Loader/      # Loading UI components
│       ├── PageComponent/ # Page-specific components
│       └── VoiceAssistant/ # Voice interaction features
└── tsconfig.json        # TypeScript configuration
```

## Key Features

- App Router-based routing system
- Authentication with Firebase
- Data storage with MongoDB
- Real-time communication with Socket.io
- AI-powered features using OpenAI

## Deployment with Vercel

### Preparing for Deployment

1. Make sure your project is pushed to a Git repository (GitHub, GitLab, or Bitbucket).

2. Ensure all environment variables are properly set in your local `.env` file.

### Deploying to Vercel

1. Create an account on [Vercel](https://vercel.com) if you don't have one.

2. From the Vercel dashboard, click "New Project".

3. Import your Git repository.

4. Configure project:

   - Set the framework preset to "Next.js"
   - Configure the environment variables (copy from your `.env` file)
   - Add any additional build settings if needed

5. Click "Deploy".

### Updating Environment Variables on Vercel

1. Go to your project on Vercel dashboard.
2. Navigate to "Settings" > "Environment Variables".
3. Add or update your environment variables as needed.
4. Redeploy your application for the changes to take effect.

### Setting up a Custom Domain

1. In your Vercel project, go to "Settings" > "Domains".
2. Add your custom domain and follow the verification steps.

## Contributing

Please follow the existing code style and organization when contributing to the project. Make use of TypeScript for type safety.

## Troubleshooting

- If you encounter issues with the MongoDB connection, verify your connection string and network access settings.

## Tickets / Implementation Summary

This section documents the changes completed for Tickets 1–3. Ticket 4 (Pre‑screening questions) is intentionally not included yet.

### Ticket 1 — Development environment setup

- Forked/cloned the repository and installed dependencies.
- Connected external services and verified a working local build.
- Added explicit environment variables and wiring for the Core API.

Set your Core API base URL in `.env`:

```
NEXT_PUBLIC_CORE_API_URL=<your_core_api_url>
```

Checklist of required environment variables (see `.env.example`):

```
OPENAI_API_KEY=your_openai_api_key
MONGODB_URI=your_mongodb_connection_string
FIREBASE_SERVICE_ACCOUNT=your_firebase_service_account_json
NEXT_PUBLIC_CORE_API_URL=<your_core_api_url>
```

### Ticket 2 — Segmented "Add new career" form (Steps 1–5)

Goal: Convert the career creation flow into a segmented, navigable wizard with a progress header and local draft persistence.

Key files (paths are relative to `src/`):

- `lib/components/CareerComponents/CareerFormV2.tsx` — orchestrates steps, validations, save/publish.
- `lib/components/CareerComponents/ProgressHeader.tsx` — progress header with error highlighting and partial progress support.
- `lib/components/CareerComponents/steps/Step1CareerDetails.tsx` — step 1: core job details and access.
- `lib/components/CareerComponents/steps/Step2CVReview.tsx` — step 2: screening settings (pre‑screening expansion comes with Ticket 4).
- `lib/components/CareerComponents/steps/Step3AI_Interview.tsx` — step 3: AI interview categories and questions.
- `lib/components/CareerComponents/steps/Step4Pipeline.tsx` — step 4: static pipeline overview.
- `lib/components/CareerComponents/steps/Step5Review.tsx` — step 5: final review with publish and draft actions.
- `lib/hooks/useAutoSaveDraft.ts` — debounced auto‑save hook.
- `lib/utils/draftStorage.ts` — helpers to load/save/clear drafts in localStorage.

What the user can do now:

- Navigate among steps 1–5 with clear progress feedback.
- Leave the page and come back later; progress is auto‑saved locally and restored.
- Save a draft explicitly from step 5 and continue editing later.

Notes:

- Drafts are stored client‑side under keys like `careerDraft:new` or `careerDraft:<id>`.
- To clear a draft manually, remove keys that start with `careerDraft:` from your browser’s localStorage.

### Ticket 3 — Input sanitization against XSS

Objective: Prevent malicious HTML/JS from being stored or rendered while still allowing safe formatting in rich text fields.

Key files:

- `lib/utils/sanitize.ts` — exposes `sanitizeStrict`, `sanitizeRich`, and `deepSanitize` utilities.
- `app/api/add-career/route.ts` — sanitizes incoming payload before insert.
- `app/api/update-career/route.tsx` — sanitizes incoming payload before update.

Highlights:

- Server‑side sanitization is performed before persisting data.
- Plain text fields (e.g., job title, location) are stripped of HTML.
- Rich text fields (e.g., description) allow a minimal safe subset of tags; links are transformed to safe attributes.
- Deep sanitization ensures nested fields are also cleaned.
- Numeric fields are clamped to safe ranges; length limits reduce payload abuse.

## Draft auto‑save and resume (Careers form)

- The segmented "Add new career" form auto‑saves progress to localStorage under a draft key (for example, `careerDraft:new`).
- Progress, including the current step and per‑step inputs like interview questions, is restored automatically when you return.
- To clear a draft manually, clear site data for this origin in your browser or remove the `careerDraft:*` keys in localStorage.
- For privacy, avoid storing sensitive information in drafts on shared machines.
- For Firebase authentication problems, check your Firebase service account credentials.
- For development issues, try running `npm run clean` followed by `npm install` and `npm run dev`.
