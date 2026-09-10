# Phase 0 Research: Add Connection by Email

**Feature**: [spec.md](./spec.md) | **Date**: 2026-09-09

This feature has no external/unfamiliar technology — it extends an existing
Expo + Firebase app using the stack already in place. Research here resolves
the *design* unknowns the spec introduced (pending requests, mutual access,
cancel/decline semantics), not tooling unknowns.

## Technical Context resolution

All Technical Context fields are known from the existing codebase; none
require `NEEDS CLARIFICATION`:

- **Language/Version**: TypeScript (strict), targeting Node.js 20 for Cloud
  Functions (`functions/package.json` `engines.node: "20"`) and Expo SDK 49
  / React Native 0.72.5 for the client.
- **Primary Dependencies**: Expo (managed workflow), React Navigation 6,
  `react-native-paper`, Formik + Yup (forms/validation), Firebase JS SDK
  `^10.4.0` (client), `firebase-admin`/`firebase-functions` v2 `onCall`
  (server).
- **Storage**: Firestore (existing `users/{email}` documents and
  subcollections).
- **Testing**: `@firebase/rules-unit-testing` + Jest for security rules
  (`npm run test:rules`); `jest-expo` for component/unit tests (`npm run
  test:tsx`); Maestro (`run-maestro-tests` skill) for e2e, iPhone 17 (iOS
  26.5) simulator only, per constitution.
- **Target Platform**: iOS/Android/Web via Expo managed workflow; e2e
  verification is iOS-simulator-only per constitution.
- **Project Type**: Mobile app (Expo) + Firebase backend (Cloud Functions +
  Firestore), matching the existing single-repo structure.
- **Performance Goals**: SC-004 — pending/accepted state visible within 2s
  with no manual refresh, which rules out the current "navigate back with a
  refresh param" pattern in favor of a live `onSnapshot` listener.
- **Constraints**: Must stay inside the existing Firestore trust model
  (constitution II — rules are the source of truth, not client checks);
  must not introduce a new state-management library (constitution IV); must
  not introduce push-notification infrastructure (explicitly out of scope
  per spec Clarifications).
- **Scale/Scope**: Small personal-use app; no load/scale concerns.

## Decision: How to model pending connection requests in Firestore

**Decision**: Store each pending request as a mirrored pair of documents,
one under each party's own `users/{email}` document, keyed by the *other*
person's email as the document ID:

- `users/{recipientEmail}/connectionRequests/{senderEmail}` — `direction: "incoming"`
- `users/{senderEmail}/connectionRequests/{recipientEmail}` — `direction: "outgoing"`

Both documents are written together (as an atomic batch) by a Cloud
Function using the Admin SDK; no client ever writes to this subcollection
directly.

**Rationale**:
- Reuses the existing `users/{email}/{document=**}` subcollection pattern
  already used for `ideas`, so each user's rules stay scoped to their own
  document tree (`loggedInAndMine`) with no cross-document security rule
  needed — consistent with constitution II.
- Using the other party's email as the document ID gives duplicate
  prevention (FR-005) for free: a second request between the same pair is
  a check for document existence, not a query.
- It also makes the "two users request each other before either responds"
  case (an Assumption in the spec) a simple, local check: when creating an
  outgoing request, the Cloud Function first checks whether a matching
  *incoming* request from that same email already exists on the sender's
  own document tree — if so, it treats the new call as an acceptance
  instead of creating a duplicate pending pair.
- Each user's own `connectionRequests` subcollection (both incoming and
  outgoing entries) can be read with a single `onSnapshot` listener,
  satisfying SC-004's 2-second visibility requirement without polling.

**Alternatives considered**:
- *Single top-level `connectionRequests` collection*, queried with `where
  fromEmail == me OR toEmail == me`. Rejected: Firestore doesn't support OR
  across different fields in one query (would need two listeners anyway),
  and per-document security rules would need to inspect `resource.data`
  fields rather than reusing the existing `loggedInAndMine(email)` path
  pattern, adding rule complexity for no benefit at this scale.
- *Auto-generated document IDs* instead of using the other party's email.
  Rejected: would require a query (`where otherEmail == X`) to detect
  duplicates/mutual requests instead of a direct `get`, and duplicate
  prevention would need to be enforced in application logic rather than
  falling out of the data shape.

## Decision: How active (accepted) connections stay represented

**Decision**: Keep using the existing `canView: string[]` array field on
`users/{email}`, unchanged in shape. Acceptance performs `arrayUnion` of
each party's email into the *other* party's `canView` array (two writes,
one per direction), which is what makes the connection mutual per the
spec's Clarifications. Cancel/decline never touch `canView`.

**Rationale**: `firestore.rules`'s `canViewIdeasGranted` already grants read
access to `users/{email}/ideas/**` for any email present in that user's
`canView` array. Making acceptance a mutual `arrayUnion` requires **no**
change to `firestore.rules` for the existing ideas-sharing rule — only the
new `connectionRequests` subcollection needs a new rule. This is the
smallest change that satisfies the mutual-access requirement (FR-008).

**Alternatives considered**: A dedicated `connections` collection with an
explicit two-way join document. Rejected as unnecessary complexity — the
existing `canView` array already *is* the access-control mechanism the
security rules depend on; introducing a parallel "connections" record would
create a second source of truth that must stay in sync with `canView`,
violating the constitution's "avoid unnecessary abstraction" spirit and
Firestore-Rules-as-source-of-truth principle (II).

## Decision: Where request-lifecycle logic lives

**Decision**: All four mutating operations (`sendConnectionRequest`,
`acceptConnectionRequest`, `declineConnectionRequest`,
`cancelConnectionRequest`) are implemented as Firebase Cloud Functions
(`onCall`), following the existing `addConnection` function's pattern
(auth check, input validation, normalization, `not-found`/`failed-
precondition` errors). The client only reads via `onSnapshot` listeners and
invokes these callables — it performs no direct Firestore writes to
`canView` or `connectionRequests`.

**Rationale**: Matches constitution II (validation/authorization lives
server-side, not duplicated in the client) and reuses a pattern already
proven in this codebase (`functions/src/index.ts` `addConnection`).
Performing the mutual `canView` update and the `connectionRequests`
cleanup in one Cloud Function call (using a Firestore batch/transaction)
also avoids the partial-failure states a multi-step client-side flow would
risk.

**Alternatives considered**: Client-side writes gated purely by Firestore
rules (no Cloud Functions). Rejected: the enumeration-safe generic error
message (FR-004) and the "check for existing account before creating a
request" logic require a server-side read-then-decide step that Firestore
rules alone cannot express as a clean, user-facing error message.

## Decision: List/detail UI approach

**Decision**: Replace the currently-stubbed `findAllConnections` with a
live Firestore listener (`onSnapshot`) on the user's own document (for
`canView`) and their `connectionRequests` subcollection (for pending
incoming/outgoing), exposed via a small custom hook (e.g.
`useConnections`), consistent with the constitution's "custom hooks where
present" convention (`useAuth`, etc.). `ListConnections.tsx` renders three
sections: active connections, incoming requests (with accept/decline
actions), outgoing requests (with a cancel action).

**Rationale**: Directly satisfies FR-011 (list updates without manual
restart) and SC-004 (2-second visibility), and removes the currently-dead
`refreshContent` navigation-param pattern in `AddConnection.tsx` /
`ListConnections.tsx` in favor of a self-updating listener — fewer moving
parts, no reliance on navigation timing.

**Alternatives considered**: Keep the "refresh on navigate back" pattern
and add a manual pull-to-refresh. Rejected: doesn't satisfy "no manual
refresh required" (SC-004) and doesn't help a user who is looking at the
list when someone else accepts/declines/cancels asynchronously.
