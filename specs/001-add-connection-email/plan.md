# Implementation Plan: Add Connection by Email

**Branch**: `001-add-connection-email` | **Date**: 2026-09-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-add-connection-email/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Users send a connection request to another registered user by email; the
recipient must accept before either side gains the ability to view the
other's ideas (mutual access). Requests can be canceled by the sender or
declined by the recipient before acceptance. Technical approach: extend the
existing `addConnection`-style Cloud Function pattern into four `onCall`
functions backed by a new `users/{email}/connectionRequests/{otherEmail}`
subcollection (mirrored per party), while reusing the existing `canView`
array — now updated mutually on acceptance — so the current
`firestore.rules` ideas-sharing rule needs no change. The client replaces
the currently-stubbed `findAllConnections` with live `onSnapshot`
listeners exposed through a new custom hook, per research.md.

## Technical Context

**Language/Version**: TypeScript (strict), Node.js 20 (Cloud Functions), Expo SDK 49 / React Native 0.72.5 (client)

**Primary Dependencies**: Expo (managed workflow), React Navigation 6, `react-native-paper`, Formik + Yup, Firebase JS SDK `^10.4.0` (client), `firebase-admin`/`firebase-functions` v2 `onCall` (server)

**Storage**: Firestore — existing `users/{email}` documents (`canView` field, now updated mutually) plus a new `users/{email}/connectionRequests/{otherEmail}` subcollection

**Testing**: `@firebase/rules-unit-testing` + Jest for security rules (`npm run test:rules`), `jest-expo` for component/unit tests (`npm run test:tsx`), Maestro via the `run-maestro-tests` skill for e2e on the iPhone 17 (iOS 26.5) simulator

**Target Platform**: iOS/Android/Web via Expo managed workflow; e2e verification is iOS-simulator-only per constitution

**Project Type**: Mobile app (Expo) + Firebase backend (Cloud Functions + Firestore), single repo

**Performance Goals**: Pending/accepted state visible within 2 seconds with no manual refresh (SC-004) — requires a live listener, not the current "refresh-on-navigate-back" pattern

**Constraints**: Must stay inside the existing Firestore trust model (validation/authorization server-side, per constitution II); no new state-management library (constitution IV); no push-notification infrastructure (explicitly out of scope per spec Clarifications)

**Scale/Scope**: Small personal-use app; no load/scale concerns

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Result |
|---|---|---|
| I. Type Safety First | New `ConnectionRequest` interface required in `types/DataStoreTypes.ts`; no `any` introduced | PASS |
| II. Firestore Rules Are the Source of Truth | New subcollection readable only via `loggedInAndMine`; all writes go through Cloud Functions (Admin SDK), no client write path exists to bypass validation; rule tests required in `test/**` (see contracts/firestore-schema.md) | PASS |
| III. Modular Firebase SDK with Managed Subscriptions | Replaces stubbed one-shot reads with `onSnapshot` listeners, cleaned up in `useEffect` return, using the existing modular `firebase/firestore` API | PASS |
| IV. Functional, Hook-Based Architecture | New `useConnections`-style hook follows the existing `useAuth` convention; no global state library added | PASS |
| V. No Hardcoded Credentials | No new secrets/config introduced | PASS |

No violations — Complexity Tracking table below is empty/not applicable.

## Project Structure

### Documentation (this feature)

```text
specs/001-add-connection-email/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── functions.md
│   └── firestore-schema.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

This feature extends the existing single-repo mobile-app-plus-Firebase-
backend layout already in place — no new top-level directories:

```text
types/
└── DataStoreTypes.ts        # add ConnectionRequest interface

src/app/connections/
├── AddConnection.tsx        # update: calls sendConnectionRequest, handles new error cases
├── ListConnections.tsx      # update: renders active + incoming + pending-sent sections via useConnections
├── ConnectionsService.ts    # update: sendConnectionRequest/accept/decline/cancel callables + live listeners
└── useConnections.ts        # new: custom hook wrapping onSnapshot listeners (canView + connectionRequests)

functions/src/
└── index.ts                 # update: sendConnectionRequest, acceptConnectionRequest,
                              #         declineConnectionRequest, cancelConnectionRequest

firestore.rules              # update: add users/{email}/connectionRequests/{document=**} read rule

test/
├── firebase.rules.authenticated.self.spec.ts   # extend: connectionRequests read/write cases
└── firebase.rules.unauthenticated.spec.ts      # extend: unauthenticated denial cases
```

**Structure Decision**: Single project (mobile app + Firebase backend in one
repo), matching the existing structure — no frontend/backend split and no
new project boundaries. All new code lands inside the existing
`src/app/connections/**`, `functions/src/index.ts`, and `test/**`
locations that already own this feature area.

## Post-Design Constitution Re-Check

*Performed after Phase 1 (data-model.md, contracts/, quickstart.md).*

Re-reading the table above against the finished design in `data-model.md`
and `contracts/`: the subcollection is read-only from the client (rules
enforce this, no write rule was added), all four mutations funnel through
Cloud Functions, the new `ConnectionRequest` type is explicit and
`any`-free, listeners are `onSnapshot` with cleanup, and no new dependency
or state library was introduced. **No new violations were introduced by
the detailed design; all five principles remain PASS.**

## Complexity Tracking

No Constitution Check violations — this section is not applicable.
