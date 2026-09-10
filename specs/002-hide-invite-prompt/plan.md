# Implementation Plan: Hide Home Invite Prompt for Connected Users

**Branch**: `002-hide-invite-prompt` | **Date**: 2026-09-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-hide-invite-prompt/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

The Home screen currently always shows a "To invite someone to your ideas, click below." message and an "Add" button. Once a user already has more than one active (accepted) connection, that nudge is no longer useful. Technical approach: reuse the existing `useConnections` hook (already powering the Connections tab) from `Home.tsx` to read `activeConnections.length` and `isLoading`, and conditionally render the message/button only when the count is 1 or fewer — or still unknown (loading, or a listener error that never resolves `isLoading`), which keeps the feature fail-open per the spec's Clarifications. No backend, Firestore rules, or data-model changes are required; this is a client-only render-condition change plus its test.

## Technical Context

**Language/Version**: TypeScript (strict), Expo SDK ~49.0.13 / React Native 0.72.5 (client only — no Cloud Functions changes)

**Primary Dependencies**: Expo (managed workflow), React Navigation 6 (`@react-navigation/bottom-tabs`, `@react-navigation/native-stack`), `react-native-paper` ^5.10.6, Firebase JS SDK ^10.4.0 (client, via the existing `useConnections` hook — no new SDK usage)

**Storage**: Firestore — reads only the existing `users/{email}` doc (`canView` array) and `users/{email}/connectionRequests` subcollection, both already read by `useConnections`; no schema changes

**Testing**: `jest-expo` + `@testing-library/react-native` component test (`npm run test:tsx`) for `Home.tsx`, following the existing mock-the-hook pattern used in `MyIdeas.test.tsx`/`AddIdea.test.tsx`; optional manual/Maestro smoke check via the `run-maestro-tests` skill (no new Maestro flow required, since existing seed data does not include a two-active-connection fixture)

**Target Platform**: iOS/Android/Web via Expo managed workflow; e2e verification (if performed) is iOS-simulator-only (iPhone 17, iOS 26.5) per constitution

**Project Type**: Mobile app (Expo) + Firebase backend, single repo — this feature touches only the client

**Performance Goals**: None beyond existing — reuses an already-mounted-elsewhere real-time listener pattern; no new goals introduced

**Constraints**: Must not add a second Firestore subscription for the same data (constitution III + avoids duplicate `onSnapshot` cost); must default to showing the prompt whenever the connection count is not yet confirmed (spec Clarifications — fail open)

**Scale/Scope**: Single screen (`src/app/Home.tsx`); no data volume/scale concerns

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Result |
|---|---|---|
| I. Type Safety First | Consumes the already-typed `UseConnectionsResult` from `useConnections`; no `any` introduced by this feature | PASS |
| II. Firestore Rules Are the Source of Truth | No new reads/writes and no rule changes — reuses reads already permitted to the authenticated owner via the existing `connectionRequests`/`users/{email}` rules | PASS |
| III. Modular Firebase SDK with Managed Subscriptions | No new listener is created; `Home.tsx` consumes the existing `useConnections` hook, which already registers `onSnapshot` inside `useEffect` with cleanup | PASS |
| IV. Functional, Hook-Based Architecture | `Home.tsx` remains a functional component; reuses an existing custom hook; no global state library introduced | PASS |
| V. No Hardcoded Credentials | No secrets/config touched | PASS |

No violations — Complexity Tracking table below is empty/not applicable.

*Re-checked after Phase 1 design (data-model.md, contracts/, quickstart.md): no new entities, dependencies, listeners, or rules were introduced during design — all five gates remain PASS unchanged.*

## Project Structure

### Documentation (this feature)

```text
specs/002-hide-invite-prompt/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── home-invite-prompt.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

This feature extends the existing single-repo mobile-app-plus-Firebase-backend
layout already in place — no new top-level directories, and no changes under
`functions/`:

```text
src/app/
├── Home.tsx                       # Modified: consume useConnections, conditionally render invite prompt
├── Home.test.tsx                  # New: component test covering FR-001/002/006
├── connections/
│   └── useConnections.ts          # Reused as-is (no changes) — already returns activeConnections + isLoading
└── test-utils/
    └── renderWithAppContext.tsx   # Reused existing test helper
```

**Structure Decision**: Single existing project structure, unchanged. The only production code change is `src/app/Home.tsx`; it imports the already-existing `src/app/connections/useConnections.ts` hook rather than introducing a new one. No backend, rules, or index changes.

## Complexity Tracking

> No constitution violations — this table intentionally left empty.
