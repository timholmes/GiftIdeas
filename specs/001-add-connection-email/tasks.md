---

description: "Task list template for feature implementation"
---

# Tasks: Add Connection by Email

**Input**: Design documents from `/specs/001-add-connection-email/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Firestore security-rules test tasks are included because the constitution
(Principle II) mandates rule coverage in `test/**`. No other new test-writing tasks are
included, since the feature spec does not request TDD or additional test coverage beyond
that constitutional requirement; `npm run test:ci` and the Maestro e2e walkthrough (both
existing, required verification processes) still appear in Polish as verification steps.

**Organization**: Tasks are grouped by user story (from spec.md) to enable independent
implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- File paths are exact and relative to the repository root

## Path Conventions

Single project (existing repo structure) — no new top-level directories. Client code
under `src/app/connections/`, Cloud Functions in `functions/src/index.ts`, shared types
in `types/`, security rules in `firestore.rules`, rules tests in `test/`.

---

## Phase 1: Setup

**Purpose**: Confirm the environment this feature builds on is ready.

- [X] T001 Confirm the local Firebase emulators (Auth, Firestore, Functions) start cleanly via `npm run backend:start`, per quickstart.md prerequisites — no code change, just a working local baseline before implementation begins

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared type, security rule, and data-access hook that every user story depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 Add a `ConnectionRequest` interface to `types/DataStoreTypes.ts` with fields `otherEmail: string`, `direction: 'incoming' | 'outgoing'`, `createdAt: FirebaseFirestore.Timestamp | Date`, exactly as specified in `specs/001-add-connection-email/data-model.md`
- [X] T003 [P] Add a `match /users/{email}/connectionRequests/{document=**}` block to `firestore.rules` with `allow read: if loggedInAndMine(email)` and **no** client write rule (all writes go through Cloud Functions using the Admin SDK), per `specs/001-add-connection-email/contracts/firestore-schema.md`
- [X] T004 [P] Extend `test/firebase.rules.authenticated.self.spec.ts` with cases: an authenticated user can read their own `connectionRequests` subcollection; cannot read another user's `connectionRequests` subcollection; a direct client write to `connectionRequests` is denied by the rules — depends on T003
- [X] T005 [P] Extend `test/firebase.rules.unauthenticated.spec.ts` with a case asserting an unauthenticated read of any user's `connectionRequests` subcollection is denied — depends on T003
- [X] T006 Create `src/app/connections/useConnections.ts`, a custom hook that exposes the current user's live `canView` array (active connections) and their `connectionRequests` subcollection split into `incoming`/`outgoing`, using `onSnapshot` listeners registered in `useEffect` and unsubscribed in its cleanup function, per `specs/001-add-connection-email/research.md` — depends on T002

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - Send a connection request by email (Priority: P1) 🎯 MVP

**Goal**: A user can send a connection request by entering another registered user's email, see it appear as pending, and cancel it before the recipient responds.

**Independent Test**: Enter a valid, registered email into the "Add Connection" form and submit; confirm a pending request is created and visible with no other feature required.

### Implementation for User Story 1

- [X] T007 [US1] Implement `sendConnectionRequest` as an `onCall` function in `functions/src/index.ts` (replacing `addConnection`): derive the caller's identity from `request.auth.token.email` rather than a client-supplied field; validate `targetEmail` format (FR-002); reject self-add with `failed-precondition` (FR-003); reject with a generic, enumeration-safe `not-found` error when no `users/{targetEmail}` document exists — the error text MUST NOT confirm or deny that the account exists (FR-004); reject with `already-exists` when an active connection or an existing outgoing pending request to that email already exists (FR-005); when a matching *incoming* request from that same email already exists, short-circuit into the same effect as acceptance instead of creating a duplicate pending pair (mutual-request case in data-model.md); otherwise create the mirrored `connectionRequests` pair (FR-006) — full request/response/error shape per `specs/001-add-connection-email/contracts/functions.md`
- [X] T008 [US1] Implement `cancelConnectionRequest` as an `onCall` function in `functions/src/index.ts`: caller-only, deletes the mirrored pending `connectionRequests` pair, returns `not-found` if no matching outgoing request exists for the caller (FR-014), per `specs/001-add-connection-email/contracts/functions.md` — same file as T007, implement after it
- [X] T009 [US1] Replace the `addConnection` wrapper in `src/app/connections/ConnectionsService.ts` with `sendConnectionRequest(targetEmail)` and `cancelConnectionRequest(toEmail)` callable wrappers matching the request/response shapes in `specs/001-add-connection-email/contracts/functions.md` — depends on T007, T008
- [X] T010 [P] [US1] Update `src/app/connections/AddConnection.tsx` to call `sendConnectionRequest`, show a "request sent — pending" confirmation on success, and rely on the live `useConnections` listener (T006) for list updates instead of the `refreshContent` navigation param — depends on T009
- [X] T011 [P] [US1] Add a "Pending (sent by you)" section to `src/app/connections/ListConnections.tsx`, sourced from `useConnections`'s outgoing requests, with a Cancel action per entry wired to `cancelConnectionRequest` — depends on T009, T006

**Checkpoint**: User Story 1 is independently functional — send, see pending, cancel.

---

## Phase 4: User Story 2 - Accept or decline a connection request (Priority: P2)

**Goal**: A recipient can accept a pending request (establishing mutual access) or decline it (no connection created).

**Independent Test**: With a pending incoming request already present, verify accepting grants mutual access and declining does not.

### Implementation for User Story 2

- [X] T012 [US2] Implement `acceptConnectionRequest` as an `onCall` function in `functions/src/index.ts`: recipient-only; in a single batch, delete the mirrored pending `connectionRequests` pair and `arrayUnion` each party's email into the *other* party's `canView` (FR-008), per `specs/001-add-connection-email/contracts/functions.md`
- [X] T013 [US2] Implement `declineConnectionRequest` as an `onCall` function in `functions/src/index.ts`: recipient-only; deletes the mirrored pending pair; does not modify `canView`; the response carries no distinct "declined" signal the sender's client could surface (FR-009), per `specs/001-add-connection-email/contracts/functions.md` — same file as T012, implement after it
- [X] T014 [US2] Add `acceptConnectionRequest(fromEmail)` and `declineConnectionRequest(fromEmail)` callable wrappers to `src/app/connections/ConnectionsService.ts`, matching `specs/001-add-connection-email/contracts/functions.md` — depends on T012, T013
- [X] T015 [US2] Add a "Pending (received)" section to `src/app/connections/ListConnections.tsx`, sourced from `useConnections`'s incoming requests, with Accept/Decline actions per entry wired to the new wrappers — depends on T014, T006; same file as T011, implement after it

**Checkpoint**: User Stories 1 and 2 are both independently functional.

---

## Phase 5: User Story 3 - Clear feedback on failed or blocked attempts (Priority: P3)

**Goal**: Every blocked or failed send attempt shows the user a specific, correct message.

**Independent Test**: Attempt self-add, duplicate/pending, unregistered-email, and network-failure sends; confirm each produces its own distinct, correct message.

### Implementation for User Story 3

- [X] T016 [US3] In `src/app/connections/AddConnection.tsx`, map each `sendConnectionRequest` failure to its required user-facing message: self-add (`failed-precondition`) → specific "you can't add yourself" message (FR-003); duplicate/pending (`already-exists`) → specific "already connected or a request is already pending" message (FR-005); unregistered email (`not-found`) → the generic, non-confirming "couldn't send request" message that must not reveal whether the account exists (FR-004, per `specs/001-add-connection-email/contracts/firestore-schema.md`); any other system/network failure → generic message inviting retry (FR-012) — depends on T010

**Checkpoint**: User Stories 1, 2, and 3 are all independently functional.

---

## Phase 6: User Story 4 - View connections and pending requests (Priority: P4)

**Goal**: The connections list clearly distinguishes active connections from pending sent/received requests, with a correct empty state.

**Independent Test**: View the list with zero, active-only, and mixed pending/active entries; confirm the correct sections render and the empty state shows only when everything is empty.

### Implementation for User Story 4

- [X] T017 [US4] Add an "Active Connections" section to `src/app/connections/ListConnections.tsx` rendering `canView` entries from `useConnections`, visually distinct from the "Pending (sent by you)" (US1) and "Pending (received)" (US2) sections — same file as T011/T015, implement after them
- [X] T018 [US4] Implement the empty-state message in `src/app/connections/ListConnections.tsx`, shown only when active connections, incoming requests, and outgoing requests are all empty (replacing the current unconditional "No connections yet" message) — same file as T017, implement after it

**Checkpoint**: All four user stories are independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verification and cleanup spanning all stories.

- [X] T019 [P] Run `npm run test:ci` (rules + tsx) and fix any regressions surfaced by the new `connectionRequests` rules and UI changes
- [ ] T020 Execute the `specs/001-add-connection-email/quickstart.md` 8-step Maestro validation walkthrough via the `run-maestro-tests` skill against the iPhone 17 (iOS 26.5) simulator, confirming SC-001 through SC-005
  - BLOCKED: `maestro/connections.yaml` was authored and the pre-Cloud-Function portion (empty state, FAB navigation to Add Connection, email entry) was verified passing live on the iPhone 17 simulator. The rest is blocked by a pre-existing environment defect, not this feature: the local Functions emulator's HTTP discovery correctly lists all callable functions (including the new ones), but `firebase-tools@12.5.2` fails to parse that same discovery response ("Failed to parse build specification") — confirmed unrelated to this feature by reproducing the identical failure on the pre-existing `helloWorld` function. Re-run this task once `firebase-tools` is upgraded to a version compatible with `firebase-functions@6.6.0`.
- [X] T021 [P] Remove the dead, commented-out `findAllConnections`/`onLoad` code this feature replaces in `src/app/connections/ConnectionsService.ts` and `src/app/connections/ListConnections.tsx`; confirm `deleteConnectionByEmail` (connection removal, out of scope per spec Assumptions) is left intact and unaffected

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories.
- **User Stories (Phase 3-6)**: All depend on Foundational completion.
  - US1 (P1) has no dependency on US2/US3/US4.
  - US2 (P2) depends on Foundational only; its UI task (T015) lands in the same file as US1's UI task (T011), so implement US1 before US2 in practice even though there's no functional coupling.
  - US3 (P3) builds its message-mapping on top of US1's `AddConnection.tsx` changes (T010) — functionally depends on US1 being done.
  - US4 (P4) builds its "Active Connections" section on top of the list file US1/US2 already modified (T011, T015) — functionally depends on US1 and US2 being done.
- **Polish (Phase 7)**: Depends on all desired user stories being complete.

### Within Each User Story

- Cloud Functions before client service wrappers before UI (T007/T008 → T009 → T010/T011).
- Story complete and checkpointed before moving to the next priority.

### Parallel Opportunities

- T004 and T005 (different rule-test files) can run in parallel once T003 is done.
- T010 and T011 (different files) can run in parallel once T009 is done.
- T019 and T021 (different concerns/files) can run in parallel during Polish.

---

## Parallel Example: Foundational Phase

```bash
# After T003 (firestore.rules) is done, run these together:
Task: "Extend test/firebase.rules.authenticated.self.spec.ts with connectionRequests read/deny cases"
Task: "Extend test/firebase.rules.unauthenticated.spec.ts with connectionRequests unauthenticated-denial case"
```

## Parallel Example: User Story 1

```bash
# After T009 (ConnectionsService.ts wrappers) is done, run these together:
Task: "Update src/app/connections/AddConnection.tsx to call sendConnectionRequest"
Task: "Add pending-sent section with Cancel action to src/app/connections/ListConnections.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (blocks all stories).
3. Complete Phase 3: User Story 1.
4. **STOP and VALIDATE**: send a request, see it pending, cancel it — independently, with no accept/decline/error-message/active-list work done yet.
5. Demo/deploy if ready.

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. User Story 1 → test independently → MVP: requests can be sent and canceled.
3. User Story 2 → test independently → requests can now be accepted/declined, creating real mutual connections.
4. User Story 3 → test independently → every failure mode now shows the right message.
5. User Story 4 → test independently → the list now clearly shows active vs. pending state, with a correct empty state.
6. Polish → full regression pass, e2e validation, cleanup.

Each story adds value without breaking the previous ones; US2-US4 build additively on the same `ListConnections.tsx`/`AddConnection.tsx` files US1 establishes.

## Notes

- [P] tasks touch different files and have no incomplete-task dependency on each other.
- [Story] labels map every user-story-phase task back to spec.md for traceability.
- Firestore rules test tasks (T004, T005) exist because the constitution requires rule coverage, not because the feature spec requested tests generally — no other new test-writing tasks were added.
- Commit after each task or logical group; stop at any checkpoint to validate a story independently.
