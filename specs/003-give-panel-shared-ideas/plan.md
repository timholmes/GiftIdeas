# Implementation Plan: Show Connections' Ideas on the Give Panel

**Branch**: `003-give-panel-shared-ideas` | **Date**: 2026-09-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-give-panel-shared-ideas/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

`src/app/give/GiveList.tsx` (the "Give" tab) is currently a complete stub — it renders an empty, hardcoded ideas array and never fetches anything. This feature replaces that stub with real data: for each of the signed-in user's active (accepted) connections, fetch that connection's ideas and display them grouped by connection, with a distinct empty state and fail-soft per-connection error handling. Technical approach: reuse the existing `useConnections` hook for the active-connections list, and reuse `IdeasService.ts`'s existing `findAllIdeas(email)` — which already accepts any user's email, not just the signed-in user's — calling it once per active connection via `Promise.allSettled` so one connection's failed read never blocks the others (per spec Clarifications). No Firestore rules or schema changes are needed: the `canViewIdeasGranted` rule already permits exactly this cross-user read once a connection is active.

## Technical Context

**Language/Version**: TypeScript (strict), Expo SDK ~49.0.13 / React Native 0.72.5 (client only — no Cloud Functions or rules changes)

**Primary Dependencies**: React Navigation 6 (`useFocusEffect` from `@react-navigation/native`, already imported — if currently unused — in `MyIdeas.tsx`, establishing the precedent this feature follows), `react-native-paper` ^5.10.6 (`List.Item`/`Text`), Firebase JS SDK ^10.4.0 (via the existing `findAllIdeas` and `useConnections`)

**Storage**: Firestore — reads only existing `users/{email}/ideas` subcollections (already readable cross-user via the existing `canViewIdeasGranted` rule once `canView` includes the reader) and the existing `users/{email}` / `connectionRequests` data already read by `useConnections`; no schema or rules changes

**Testing**: `jest-expo` + `@testing-library/react-native` component test (`npm run test:tsx`) for `GiveList.tsx`, mocking `useConnections` and the new `IdeasService` function, following the established pattern in `src/app/ideas/MyIdeas.test.tsx`; optional manual/Maestro smoke check via the `run-maestro-tests` skill — unlike `002-hide-invite-prompt`, existing seed data (`util/dataSeed.ts`) already gives every seeded user the same 2 ideas, so only an accepted connection between two seeded users is needed to verify manually, no extra seeding required

**Target Platform**: iOS/Android/Web via Expo managed workflow; e2e verification (if performed) is iOS-simulator-only (iPhone 17, iOS 26.5) per constitution

**Project Type**: Mobile app (Expo) + Firebase backend, single repo — this feature touches only the client

**Performance Goals**: None new — one Firestore read per active connection, at the small personal-use scale already established for this app (per `001-add-connection-email`/`002-hide-invite-prompt`); no pagination or batching needed

**Constraints**: Must isolate one connection's failed idea-fetch from the others (`Promise.allSettled`, spec FR-009/SC-006); must not add a continuous real-time listener for ideas — this screen refetches on focus, consistent with the spec's Assumptions and `MyIdeas`'s existing one-shot-fetch convention, rather than opening one `onSnapshot` per connection

**Scale/Scope**: One screen (`src/app/give/GiveList.tsx`) plus one new service function in `src/app/ideas/IdeasService.ts`; no data volume/scale concerns

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Result |
|---|---|---|
| I. Type Safety First | New return shape (grouped ideas per connection) gets an explicit `interface`; reuses the already-typed `Idea` and `UseConnectionsResult`; no `any` introduced by this feature | PASS |
| II. Firestore Rules Are the Source of Truth | No new reads beyond what `canViewIdeasGranted` already permits; no rule changes; no client-side re-validation of what the rule already enforces | PASS |
| III. Modular Firebase SDK with Managed Subscriptions | No new `onSnapshot` listener — reuses `useConnections`'s existing managed subscription for the connection list, and `findAllIdeas`'s existing modular `getDocs`/`collection` calls for ideas, fetched (not streamed) on focus | PASS |
| IV. Functional, Hook-Based Architecture | `GiveList` remains a functional component; new fetch logic lives in a plain async function in `IdeasService.ts` (matching its existing convention), invoked from a `useFocusEffect`/`useState` pair; no global state library | PASS |
| V. No Hardcoded Credentials | No secrets/config touched | PASS |

No violations — Complexity Tracking table below is empty/not applicable.

*Re-checked after Phase 1 design (data-model.md, contracts/, quickstart.md): no new entities, dependencies, listeners, or rules were introduced during design — all five gates remain PASS unchanged.*

## Project Structure

### Documentation (this feature)

```text
specs/003-give-panel-shared-ideas/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── give-panel-ideas.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

This feature extends the existing single-repo mobile-app-plus-Firebase-backend
layout already in place — no new top-level directories, and no changes under
`functions/` or `firestore.rules`:

```text
src/app/
├── ideas/
│   └── IdeasService.ts             # Modified: add findIdeasForConnections(emails), reusing the existing findAllIdeas(email) per connection via Promise.allSettled
├── give/
│   ├── GiveList.tsx                 # Modified: replace the stub with useConnections + findIdeasForConnections, grouped-by-connection display, empty/loading states
│   └── GiveList.test.tsx            # New: component test
└── connections/
    └── useConnections.ts           # Reused as-is (no changes) — already returns activeConnections
```

**Structure Decision**: Single existing project structure, unchanged. Production changes are `src/app/ideas/IdeasService.ts` (add one function, reusing the existing `findAllIdeas`) and `src/app/give/GiveList.tsx` (replace the stub). No backend, rules, or index changes; no new files outside `src/app/give/` and one addition to `src/app/ideas/IdeasService.ts`.

## Complexity Tracking

> No constitution violations — this table intentionally left empty.
