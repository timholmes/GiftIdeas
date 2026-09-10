---

description: "Task list for Hide Home Invite Prompt for Connected Users"
---

# Tasks: Hide Home Invite Prompt for Connected Users

**Input**: Design documents from `/specs/002-hide-invite-prompt/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/home-invite-prompt.md](./contracts/home-invite-prompt.md), [quickstart.md](./quickstart.md)

**Tests**: Included — `plan.md`/`quickstart.md` designate a component test (`Home.test.tsx`) as the primary, required verification method for this feature (not optional here), following the existing pattern in `src/app/ideas/MyIdeas.test.tsx`.

**Organization**: Tasks are grouped by user story from `spec.md`. Note: per `research.md`, this feature's actual behavior change is a single shared render rule in `src/app/Home.tsx` (`isLoading || activeConnections.length <= 1`) that inherently delivers all three user stories at once — it cannot be honestly split into per-story code changes. That rule is therefore implemented once, in the Foundational phase; each user story phase then adds the test case(s) that independently prove that story's slice of the contract in `contracts/home-invite-prompt.md`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Single project (Expo/React Native client + Firebase Functions backend, unchanged by this feature). All paths below are repo-root-relative, matching `plan.md`'s Project Structure.

---

## Phase 1: Setup

No setup tasks are required. This feature introduces no new dependencies, config, or project structure — it reuses the existing Expo/React Native/Firebase project as-is (`research.md`).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement the single shared render rule that every user story's tests will verify. This MUST be complete before any user story test can pass.

**⚠️ CRITICAL**: No user story test can pass until this phase is complete.

- [X] T001 In `src/app/Home.tsx`, import `useConnections` from `./connections/useConnections`, call `const { activeConnections, isLoading } = useConnections(appContext.userInfo?.email);`, compute `const shouldShowInvitePrompt = isLoading || activeConnections.length <= 1;`, and wrap the existing invite `<Text style={homeStyles.title}>To invite someone to your ideas, click below.</Text>` and the `<Button>Add</Button>` in `{shouldShowInvitePrompt && (...)}` — leaving the `Welcome, {firstName}.` `<Text>` outside that condition, unconditional (FR-001, FR-002, FR-003, FR-005, FR-006; `contracts/home-invite-prompt.md`).
- [X] T002 Create `src/app/Home.test.tsx`: mock `./connections/useConnections` (the module, not just the hook's return shape) so each test can control its return value, following the pattern in `src/app/ideas/MyIdeas.test.tsx` (mocking `./IdeasService`) and `src/app/auth/SignInStub.test.tsx`; import `renderWithAppContext` from `./test-utils/renderWithAppContext` and render `<Home route={{}} navigation={{ navigate: jest.fn() }} />` with an `AppContext` override of `{ userInfo: { firstName: 'Tim', email: 'tim@example.com' } }`. No assertions yet — this scaffold is what Phases 3-5 add test cases to.

**Checkpoint**: `src/app/Home.tsx` implements the full render rule; `src/app/Home.test.tsx` exists and can render `<Home>` with a controllable mocked `useConnections`. User story test phases can now proceed.

---

## Phase 3: User Story 1 - Hide the invite prompt once well-connected (Priority: P1) 🎯 MVP

**Goal**: Confirm the invite message and button do not render once the user has 2 or more active connections.

**Independent Test**: Run `npm run test:tsx -- Home.test.tsx` — the test case(s) added below mock 2 and 3 active connections and assert the invite message/button are absent.

- [X] T003 [US1] In `src/app/Home.test.tsx`, add a test case that mocks `useConnections` to return `{ isLoading: false, activeConnections: ['b@example.com', 'c@example.com'], incomingRequests: [], outgoingRequests: [] }`, renders `<Home>`, and asserts (via `queryByText`) that `"To invite someone to your ideas, click below."` and the `"Add"` button are both absent (FR-002; `contracts/home-invite-prompt.md` truth-table row `isLoading=false, activeConnections.length=2`).
- [X] T004 [US1] In `src/app/Home.test.tsx`, add a second test case identical to T003 but with `activeConnections: ['b@example.com', 'c@example.com', 'd@example.com']` (3 connections), asserting the same absence, to confirm the rule holds strictly above the threshold and not just exactly at it (FR-002; truth-table row `activeConnections.length=3+`).

**Checkpoint**: At this point, run `npm run test:tsx -- Home.test.tsx` — User Story 1 is independently verified. This is the MVP: the core requested behavior change is proven.

---

## Phase 4: User Story 2 - Keep showing the invite prompt to under-connected users (Priority: P2)

**Goal**: Confirm the invite message and button still render for 0 or exactly 1 active connection, preserving today's behavior.

**Independent Test**: Run `npm run test:tsx -- Home.test.tsx` — the test case(s) added below mock 0 and 1 active connections and assert the invite message/button are present.

- [X] T005 [US2] In `src/app/Home.test.tsx`, add a test case that mocks `useConnections` to return `{ isLoading: false, activeConnections: [], incomingRequests: [], outgoingRequests: [] }`, renders `<Home>`, and asserts (via `getByText`) that `"To invite someone to your ideas, click below."` and the `"Add"` button are both present (FR-001; truth-table row `activeConnections.length=0`).
- [X] T006 [US2] In `src/app/Home.test.tsx`, add a second test case identical to T005 but with `activeConnections: ['b@example.com']` (exactly 1 connection), asserting the same presence, to confirm the boundary is inclusive at 1 (FR-001; truth-table row `activeConnections.length=1`).

**Checkpoint**: At this point, run `npm run test:tsx -- Home.test.tsx` — User Stories 1 AND 2 are both independently verified (the hide and show sides of the threshold).

---

## Phase 5: User Story 3 - Prompt visibility stays current as connections change (Priority: P3)

**Goal**: Confirm the prompt defaults to shown while the connection count is unknown (fail open), and updates live as the count crosses the threshold in either direction, without remounting.

**Independent Test**: Run `npm run test:tsx -- Home.test.tsx` — the test case(s) added below cover the loading/fail-open default and a rerender that changes the mocked connection count.

- [X] T007 [US3] In `src/app/Home.test.tsx`, add a test case that mocks `useConnections` to return `{ isLoading: true, activeConnections: [], incomingRequests: [], outgoingRequests: [] }` (loading, count irrelevant), renders `<Home>`, and asserts the invite message and button are present (FR-006; truth-table row `isLoading=true`).
- [X] T008 [US3] In `src/app/Home.test.tsx`, add a test case that first mocks `useConnections` to return 1 active connection and renders `<Home>` via `rerender`-capable `render`, asserting the prompt is present; then updates the mock to return 2 active connections and calls `rerender(<Home .../>)` on the same instance (not a fresh `render`), asserting the prompt is now absent — proving the visibility updates live without remounting (FR-004; User Story 3 scenario 1).
- [X] T009 [US3] In `src/app/Home.test.tsx`, add a test case mirroring T008 but in reverse: start the mock at 2 active connections (prompt absent), `rerender` after changing the mock to 1 active connection, and assert the prompt reappears (FR-004; User Story 3 scenario 2).

**Checkpoint**: All three user stories are now independently verified; the full `contracts/home-invite-prompt.md` truth table is covered by `src/app/Home.test.tsx`.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Confirm the change is clean and doesn't regress anything outside this feature's direct scope.

- [X] T010 [P] Run `npm run test:tsx` (full suite, not just `Home.test.tsx`) and `npm run test:ci` from the repo root to confirm no regressions in `src/app/ideas/MyIdeas.test.tsx`, `src/app/ideas/AddIdea.test.tsx`, `src/app/auth/SignInStub.test.tsx`, or the Firestore rules tests (none of which this feature should affect, per the Constitution Check in `plan.md`).
- [X] T011 [P] Run `npx tsc --noEmit` from the repo root to confirm `src/app/Home.tsx` and `src/app/Home.test.tsx` introduce no TypeScript errors and no `any` (constitution Principle I).
- [ ] T012 Execute the optional manual/Maestro smoke check described in `specs/002-hide-invite-prompt/quickstart.md` (Section 2) on the iPhone 17 (iOS 26.5) simulator via the `run-maestro-tests` skill, if a third seeded/test account is available to reach 2 active connections — optional, not required to consider the feature complete since T001-T009 already cover the full contract.

**Checkpoint**: Feature complete. `npm run test:tsx` and `npm run test:ci` pass; no new TypeScript errors; `quickstart.md` expected outcomes met.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: None — no tasks.
- **Foundational (Phase 2)**: No dependencies beyond Setup — BLOCKS all user story test phases (T003-T009 all need `Home.tsx`'s render rule and `Home.test.tsx`'s scaffold from T001/T002 to exist first).
- **User Stories (Phase 3-5)**: All depend on Foundational (Phase 2) completion. Because all three stories' test cases live in the same file (`Home.test.tsx`) added by T002, they must be applied sequentially (T003 → T009) rather than as parallel edits, even though they are logically independent test cases. Recommended order is priority order (P1 → P2 → P3), matching the phase order below.
- **Polish (Phase 6)**: Depends on Phases 3-5 (all user story tests in place) — T010/T011 verify the whole feature; T012 is optional.

### User Story Dependencies

- **User Story 1 (P1)**: Depends only on Foundational. Fully verifiable on its own once T001-T004 are done — this is the MVP.
- **User Story 2 (P2)**: Depends only on Foundational (not on US1's test tasks) — verifies existing behavior is preserved by the same T001 change.
- **User Story 3 (P3)**: Depends only on Foundational — verifies the live-update/fail-open behavior of the same T001 change.

### Within Each User Story

- No models/services/endpoints layers apply to this feature (pure UI render-condition change) — each story phase is test-case-only, verifying behavior already implemented in Phase 2.

### Parallel Opportunities

- T001 and T002 (Phase 2) touch different files (`Home.tsx` vs. `Home.test.tsx`) and could be started in parallel, but T002's scaffold has no assertions to run until T001 exists, and every story phase needs both — in practice, do T001 then T002.
- T003-T009 all edit the same file (`Home.test.tsx`) and must be applied sequentially, not in parallel, despite being logically independent test cases for different stories.
- T010 and T011 (Phase 6) touch no shared files and can run in parallel.

---

## Parallel Example: Phase 6 Polish

```bash
# These two can run at the same time (different tools, no shared files):
Task: "Run npm run test:tsx and npm run test:ci from the repo root"
Task: "Run npx tsc --noEmit from the repo root"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (T001-T002) — this is also, unusually for this template, the entire code change.
2. Complete Phase 3: User Story 1 (T003-T004).
3. **STOP and VALIDATE**: `npm run test:tsx -- Home.test.tsx` passes the US1 cases — the requested behavior ("don't show the invite prompt once the user has more than one connection") is proven.
4. This is already deployable — hiding the prompt for well-connected users is the entire user-facing ask.

### Incremental Delivery

1. Foundational (T001-T002) → the render rule exists, but only US1 is proven by tests so far.
2. Add User Story 1 tests (T003-T004) → MVP proven → could ship here.
3. Add User Story 2 tests (T005-T006) → regression protection for the majority (0/1-connection) case confirmed.
4. Add User Story 3 tests (T007-T009) → loading/fail-open default and live-update behavior confirmed.
5. Polish (T010-T012) → full-suite regression check, typecheck, optional manual smoke test.

Because T001 implements all three stories' behavior in one pass (per `research.md`), "incremental delivery" here means incrementally adding *proof* (tests) rather than incrementally adding *behavior* — there is no partial-behavior state where, say, US1 works but US2/US3 don't, short of a bug.

### Parallel Team Strategy

Not particularly applicable to a single-file, single-rule feature this small — T001-T002 are inherently done by one person first, after which T003-T009's test cases could nominally be split across people, but since they share one file (`Home.test.tsx`), coordinating merge order would cost more than the single-developer sequential path.
