# Research: Show Connections' Ideas on the Give Panel

No items in Technical Context were marked `NEEDS CLARIFICATION` — this feature reuses existing, already-established patterns and data already readable under current Firestore rules. The decisions below record why those patterns were chosen for this specific feature.

## Decision: Reuse `findAllIdeas(email)` per connection, rather than a new query type

**Rationale**: `src/app/ideas/IdeasService.ts`'s `findAllIdeas(email: string)` already takes an arbitrary email — it was never hardcoded to the signed-in user — and returns exactly the `Idea[]` shape this feature needs. It reads `users/{email}/ideas`, which the existing `canViewIdeasGranted` Firestore rule already permits once the reader's email is in that user's `canView` array (i.e., once they're an active connection). No new query type, index, or rule is needed.

**Alternatives considered**:
- *A Firestore `collectionGroup('ideas')` query filtered somehow to "connections only"*: rejected — Firestore security rules can authorize a collection-group query per-document, but there's no way to express "only documents whose parent user's `canView` includes me" as a single indexed query condition; it would still require per-connection authorization logic, with none of the simplicity benefit, while being harder to reason about and test.
- *A new Cloud Function to aggregate connections' ideas server-side*: rejected as unnecessary — the existing client-side rule already grants exactly the access needed; adding a function would duplicate that authorization logic and add a maintenance surface for no benefit at this app's scale.

## Decision: Fetch all connections' ideas with `Promise.allSettled`, not `Promise.all`

**Rationale**: The spec (FR-009, SC-006, Clarifications) requires that one connection's failed idea-fetch never blocks or removes ideas from other connections. `Promise.allSettled` resolves with each call's individual outcome (`fulfilled`/`rejected`), so the new service function can simply keep the fulfilled results and log-and-skip the rejected ones — directly matching the fail-soft requirement with no extra try/catch bookkeeping per call.

**Alternatives considered**:
- *`Promise.all` with each `findAllIdeas` call individually wrapped in its own try/catch*: functionally equivalent but more boilerplate than `allSettled` for the same outcome.
- *Sequential `for` loop with try/catch per iteration*: rejected — slower (serializes N independent reads) for no correctness benefit, and `MyIdeas`'s existing single-user fetch has no precedent for sequential multi-read patterns to follow.

## Decision: Refetch on screen focus (`useFocusEffect`), not a continuous listener

**Rationale**: The spec's Assumptions explicitly scope this feature to refresh-on-view rather than continuous live updates, matching `MyIdeas.tsx`'s existing one-shot-fetch-on-load convention. `useFocusEffect` from `@react-navigation/native` is already imported in `MyIdeas.tsx` (currently in a commented-out block), establishing that this is the codebase's intended mechanism for "refetch when a tab is returned to" — this feature is the first to actually wire it up.

**Alternatives considered**:
- *One `onSnapshot` listener per active connection's `ideas` subcollection*: rejected — multiplies live-listener count by connection count for content (browsable gift ideas) that doesn't need sub-second freshness, and the spec explicitly scoped continuous live-updating out.
- *Fetch only once on mount (no refocus refresh)*: rejected — doesn't satisfy FR-008 ("each time the Give panel is opened or returned to"), since React Navigation keeps tab screens mounted between visits by default.

## Decision: Group ideas by connection with a section header, not a flat list with an inline owner label

**Rationale**: `src/app/connections/ListConnections.tsx` already establishes the app's visual convention for "group same-type items under a person-identifying header" (its "Pending (sent by you)" / "Pending (received)" sections). Reusing that pattern for "ideas grouped under each connection's email" keeps `GiveList` consistent with an existing screen instead of inventing a new per-row-label convention, and directly satisfies FR-003's "identifiable as belonging to that connection" requirement — the header itself is the attribution, so no change to the `Idea` type (no new "owner" field) is needed.

**Alternatives considered**:
- *Flat list with each row showing an inline owner-email badge/subtitle*: rejected — noisier when a connection has multiple ideas (repeats the same email on every row) and inconsistent with the grouped-header convention already used elsewhere in this app.
- *Adding an `ownerEmail` field to the `Idea` type itself*: rejected — `Idea` documents live under `users/{email}/ideas`, so the parent path already carries ownership; duplicating that as a stored field would be redundant data with no read benefit, since the fetch already knows which email it queried.

## Decision: Verify with a component-level Jest test, not a new/extended Maestro e2e flow

**Rationale**: Matches the precedent from `002-hide-invite-prompt`'s `research.md`: mock `useConnections` and the new `IdeasService` function, assert on rendered grouped output via `@testing-library/react-native`, following `MyIdeas.test.tsx`'s established convention. This runs fast, needs no simulator/emulator, and directly covers FR-001/002/004/006/007/009 as isolated cases — including the fail-soft partial-failure case, which is awkward to reliably trigger in a live emulator/simulator run.

**Alternatives considered**:
- *Maestro e2e as the primary verification*: rejected as primary for the same reasons as `002-hide-invite-prompt` (slower, needs simulator + emulator). Notably, this feature's manual setup is actually *easier* than `002-hide-invite-prompt`'s was: `util/dataSeed.ts` already gives every seeded user (`me@example.com`, `friend1@example.com`, `friend2@example.com`) the same 2 ideas, so an accepted connection between any two seeded users is sufficient to see the feature working manually — no extra seed data changes needed. Still, it isn't the primary verification because the fail-soft-on-partial-failure case (FR-009) has no easy way to be triggered live.

**Output**: All Technical Context items are resolved by decisions above; no unresolved unknowns remain going into Phase 1.
