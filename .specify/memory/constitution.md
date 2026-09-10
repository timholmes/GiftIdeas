<!--
Sync Impact Report
- Version change: [TEMPLATE] → 1.0.0 (initial ratification)
- Rationale: File previously contained only unfilled template placeholders; this is the
  first substantive adoption of the constitution, derived from the project's existing
  CLAUDE.md conventions and repository structure. Treated as MAJOR (1.0.0) since it
  establishes the initial governing baseline.
- Modified principles: n/a (all five principles newly defined)
- Added sections: Core Principles (5), Technology Stack Constraints, Testing &
  Verification Workflow, Governance
- Removed sections: none
- Templates requiring updates: none checked in this run (scope of /speckit-constitution
  is limited to this file; dependent templates/commands read it at runtime)
- Follow-up TODOs: none — RATIFICATION_DATE set to the date of this initial adoption
  since no prior ratified version exists to preserve
-->

# GiftIdeas Constitution

## Core Principles

### I. Type Safety First
All TypeScript code MUST use strict mode. Explicit `interface`/`type` definitions are
required for component props and for every Firestore document shape (e.g. `User`, `Idea`,
`Connection`); the `any` type MUST NOT be used. This applies to both the root app
(`src/app/**`) and `functions/src`.
Rationale: Firestore documents have no compile-time schema enforcement from the database
itself, so TypeScript types are the only static guarantee that reads/writes match the
expected shape across the app and Cloud Functions.

### II. Firestore Rules Are the Source of Truth
Data validation and access control MUST be enforced in `firestore.rules`, not duplicated
in client-side logic. UI code performs minimal validation (e.g. form field presence) and
trusts the rules to reject invalid or unauthorized writes. Every rule MUST enforce
`auth != null` unless a document is explicitly intended to be public, and rule behavior
MUST be covered by tests in `test/**`.
Rationale: Client code is not a trust boundary; duplicating validation client-side invites
drift between what the UI assumes and what the backend actually allows.

### III. Modular Firebase SDK with Managed Subscriptions
Firebase access MUST use the modular SDK (`doc`, `getDoc`, `setDoc`, etc.) matching the
`firebase@10.x` API surface. Any real-time listener (`onSnapshot`) MUST be registered
inside a `useEffect` and unsubscribed in its cleanup function.
Rationale: The modular SDK keeps bundle size and API usage consistent across the codebase;
unmanaged listeners leak subscriptions and cause duplicate or stale updates as screens
mount/unmount.

### IV. Functional, Hook-Based Architecture
All screens and components MUST be functional components using React hooks. State stays
local via React Context and custom hooks (e.g. `useAuth`, `useFirestore...`) — no global
state management library MAY be introduced without a constitution amendment. Presentation
code lives under `src/app/**`.
Rationale: The codebase has no global state library today; adding one silently increases
complexity and creates two competing patterns for the same problem.

### V. No Hardcoded Credentials
Secrets and environment-specific values MUST come from `firebase-config.json`, platform
config files (`google-services.json`, `GoogleService-Info.plist`), or environment
variables — never committed inline in source. Cloud Functions source MUST pass
`eslint --ext .js,.ts .` (`eslint-config-google`) before being considered complete.
Rationale: Credential leaks in a mobile client repo are especially hard to fully revoke
(binaries persist on devices), so keeping secrets out of source is non-negotiable.

## Technology Stack Constraints

The app is built on Expo (managed workflow) with React Native and TypeScript throughout.
Backend services are Firebase: Firestore, Auth, and Functions, with rules in
`firestore.rules` and indexes in `firestore.indexes.json`. Cloud Functions source lives in
`functions/src/index.ts` and compiles to `functions/lib/index.js`; they depend on
`firebase-admin` and `firebase-functions`. Navigation and presentation code is organized
under `src/app/**` on a file-based structure (not full Expo Router at this time). Styling
uses React Native's `StyleSheet.create`. New dependencies or a shift in any of these
choices (e.g. adopting Expo Router, a state library, or a different backend) MUST be
reflected here via a constitution amendment before being adopted project-wide.

## Testing & Verification Workflow

Firestore rules changes MUST be verified with `npm run test:rules` (or `npm run
test-firestore`) before being merged. TypeScript/UI logic is covered by `npm run
test:tsx`; `npm run test:ci` (rules + tsx, run in-band) is the required gate for CI.
End-to-end mobile testing MUST run only on the default iOS simulator, iPhone 17 (iOS
26.5), using the `run-maestro-tests` skill — no other simulator/device target is
supported for e2e runs. Functions changes MUST pass `eslint --ext .js,.ts .` under
`functions/` before deploy.

## Governance

This constitution supersedes conflicting guidance in `CLAUDE.md` or elsewhere; `CLAUDE.md`
remains the day-to-day operational guidance file for build/run commands and conventions,
but any conflict between the two is resolved in favor of this document until amended.

Amendments are made by editing this file directly, accompanied by a Sync Impact Report
(as an HTML comment at the top of the diff) summarizing the version change, modified
principles, and any added/removed sections. Versioning follows semantic versioning:
- MAJOR: backward-incompatible removal or redefinition of a principle or governance rule.
- MINOR: a new principle or materially expanded section is added.
- PATCH: wording clarifications or typo fixes with no semantic change.

Every feature plan produced by the Spec Kit workflow (`/speckit-plan` and downstream
commands) MUST be checked for compliance with these principles; any deviation MUST be
justified in that feature's plan or spec rather than silently overridden.

**Version**: 1.0.0 | **Ratified**: 2026-09-09 | **Last Amended**: 2026-09-09
