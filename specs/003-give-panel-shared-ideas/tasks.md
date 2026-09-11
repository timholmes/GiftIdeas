---

description: "Task list for Show Connections' Ideas on the Give Panel"
---

# Tasks: Show Connections' Ideas on the Give Panel

**Input**: Design documents from `/specs/003-give-panel-shared-ideas/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/give-panel-ideas.md](./contracts/give-panel-ideas.md), [quickstart.md](./quickstart.md)

**Tests**: Included — `plan.md`/`quickstart.md` designate a component test (`GiveList.test.tsx`) as the primary, required verification method for this feature (not optional here), following the existing pattern in `src/app/ideas/MyIdeas.test.tsx` and `src/app/Home.test.tsx`.

**Organization**: Tasks are grouped by user story from `spec.md`. Note: per `research.md`, the actual behavior change is one shared fetch-and-render pipeline in `src/app/give/GiveList.tsx` (plus one new service function, `findIdeasForConnections`, in `src/app/ideas/IdeasService.ts`) that inherently delivers all three user stories at once — the empty state, the grouped display, and the refetch-on-focus behavior are all part of the same component pass, not separable per-story code changes. That pipeline is therefore implemented once, in the Foundational phase; each user story phase then adds the test case(s) that independently prove that story's slice of `contracts/give-panel-ideas.md`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Single project (Expo/React Native client + Firebase Functions backend, unchanged by this feature). All paths below are repo-root-relative, matching `plan.md`'s Project Structure.

---

## Phase 1: Setup

No setup tasks are required. This feature introduces no new dependencies, config, or project structure — it reuses the existing Expo/React Native/Firebase project and the existing `useConnections`/`findAllIdeas` building blocks (`research.md`).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement the shared fetch-and-render pipeline that every user story's tests will verify. This MUST be complete before any user story test can pass.

**⚠️ CRITICAL**: No user story test can pass until this phase is complete.

- [X] T001 In `src/app/ideas/IdeasService.ts`, add an exported `ConnectionIdeas` interface (`{ email: string; ideas: Idea[] }`) and an exported `findIdeasForConnections(emails: string[]): Promise<ConnectionIdeas[]>` function that, per `contracts/give-panel-ideas.md`'s service contract: resolves to `[]` immediately for an empty `emails` array; otherwise calls the existing `findAllIdeas(email)` once per email via `Promise.allSettled`, mapping a fulfilled settlement to `{ email, ideas: <result> }` and a rejected settlement to `{ email, ideas: [] }` (logging the error with `console.error`, never throwing/rejecting the outer promise); preserves the same order as the input `emails` array.
- [X] T002 Replace the stub in `src/app/give/GiveList.tsx`: remove the unused `Swipeable`, `AnimatedFAB`, and `SwipeableItem` imports and the dead hardcoded `ideas`/`initialState`/empty `onLoad` left over from the placeholder; call `useConnections(appContext.userInfo?.email)` for `activeConnections`; add local state `connectionIdeas: ConnectionIdeas[]` (initial `[]`) and `isLoading: boolean` (initial `true`); use `useFocusEffect` (from `@react-navigation/native`) to call `findIdeasForConnections(activeConnections)` each time the screen gains focus, setting `isLoading` to `false` once the returned promise resolves and storing the result in `connectionIdeas`; render one section per `connectionIdeas` entry whose `ideas` array is non-empty — a header `<Text style={crudListStyles.titleText}>{email}</Text>` (matching `ListConnections.tsx`'s existing section-header convention) followed by a `<List.Item>` per idea showing `title` as the title and `description` as the description; when `!isLoading` and every entry's `ideas` array is empty (including when `connectionIdeas` itself is `[]`), render a `<Text style={crudListStyles.titleText}>No ideas from your connections yet.</Text>` empty-state message instead of any section; render nothing (no list, no empty-state message) while `isLoading` is `true` (FR-001 through FR-009; `contracts/give-panel-ideas.md`).
- [X] T003 Create `src/app/give/GiveList.test.tsx`: mock `../connections/useConnections` and `../ideas/IdeasService` (specifically `findIdeasForConnections`) as `jest.fn()`s, following the pattern in `src/app/ideas/MyIdeas.test.tsx` and `src/app/Home.test.tsx`; **also mock `@react-navigation/native`'s `useFocusEffect`**, since this repo has no existing precedent for testing a `useFocusEffect`-driven component and the real hook requires a `NavigationContainer` ancestor that these tests don't render. ~~A naive `jest.fn((callback) => callback())` synchronous stand-in was tried first and caused an infinite re-render loop~~ (it invoked the callback during render, so `setIsLoading(true)` fired on every render); the corrected mock aliases it to React's own `useEffect` — `useFocusEffect: (callback) => useEffect(callback, [callback])` — which correctly defers to after render and only re-runs when the callback identity changes (matching real React effect semantics, and relying on `GiveList.tsx`'s own `useCallback` to tie that identity to `activeConnections`). Keep `jest.requireActual('@react-navigation/native')`'s other exports intact via `...jest.requireActual(...)`; import `renderWithAppContext` from `../test-utils/renderWithAppContext` and render `<GiveList route={{}} navigation={{ navigate: jest.fn() }} />` with an `AppContext` override of `{ userInfo: { firstName: 'Tim', email: 'tim@example.com' } }`.

**Checkpoint**: `src/app/ideas/IdeasService.ts` exports `findIdeasForConnections`; `src/app/give/GiveList.tsx` implements the full fetch/render pipeline; `src/app/give/GiveList.test.tsx` exists and can render `<GiveList>` with controllable mocked `useConnections`/`findIdeasForConnections`/`useFocusEffect`. User story test phases can now proceed.

---

## Phase 3: User Story 1 - Browse connected people's gift ideas (Priority: P1) 🎯 MVP

**Goal**: Confirm ideas from active connections are shown, correctly grouped by connection, and the signed-in user's own ideas never appear.

**Independent Test**: Run `npm run test:tsx -- GiveList.test.tsx` — the test case(s) added below mock one and two connections with ideas and assert correct grouped display, plus confirm the user's own ideas are excluded.

- [X] T004 [US1] In `src/app/give/GiveList.test.tsx`, add a test case that mocks `useConnections` to return `{ activeConnections: ['friend1@example.com'], incomingRequests: [], outgoingRequests: [], isLoading: false }` and mocks `findIdeasForConnections` to resolve `[{ email: 'friend1@example.com', ideas: [{ id: 'i1', title: 'Weekend Cabin Gift', description: 'Book a two-night cabin stay.' }, { id: 'i2', title: 'Coffee Subscription', description: 'Three-month subscription.' }] }]`; renders `<GiveList>`; and asserts (via `findByText`, awaiting the resolved fetch) that both idea titles and the `'friend1@example.com'` header are visible (FR-001, FR-003, FR-005; `contracts/give-panel-ideas.md` row "all reads succeed").
- [X] T005 [US1] In `src/app/give/GiveList.test.tsx`, add a test case that mocks `useConnections` to return `activeConnections: ['friend1@example.com', 'friend2@example.com']` and `findIdeasForConnections` to resolve one `ConnectionIdeas` entry per email, each with a distinct idea title; asserts both connections' headers and both distinct idea titles are visible at once (FR-001, FR-003; multiple-connections case).
- [X] T006 [US1] In `src/app/give/GiveList.test.tsx`, add a test case that mocks `useConnections` to return `activeConnections: ['friend1@example.com']` and `findIdeasForConnections` to resolve `[{ email: 'friend1@example.com', ideas: [{ id: 'i1', title: 'Weekend Cabin Gift', description: '...' }] }]`; asserts that `findIdeasForConnections` was called with exactly `['friend1@example.com']` (never including `'tim@example.com'`, the signed-in user's own email) and that a distinct title unique to the signed-in user's own ideas (e.g. `'My Private Idea'`, never included in any mocked `ConnectionIdeas`) is absent from the render (FR-004; User Story 1 scenario 3).

**Checkpoint**: At this point, run `npm run test:tsx -- GiveList.test.tsx` — User Story 1 is independently verified. This is the MVP: the core requested behavior (seeing connections' ideas) is proven.

---

## Phase 4: User Story 2 - See a clear empty state when there's nothing to give ideas for yet (Priority: P2)

**Goal**: Confirm the empty-state message shows for 0 active connections, and separately for active connections with no ideas.

**Independent Test**: Run `npm run test:tsx -- GiveList.test.tsx` — the test case(s) added below mock 0 connections, and connections with empty ideas, and assert the empty-state message appears.

- [X] T007 [US2] In `src/app/give/GiveList.test.tsx`, add a test case that mocks `useConnections` to return `activeConnections: []` and `findIdeasForConnections` to resolve `[]` (per the contract's `emails: []` row); asserts the empty-state message (`'No ideas from your connections yet.'`) is visible and no section/idea is rendered (FR-006; User Story 2 scenario 1).
- [X] T008 [US2] In `src/app/give/GiveList.test.tsx`, add a test case that mocks `useConnections` to return `activeConnections: ['friend1@example.com']` and `findIdeasForConnections` to resolve `[{ email: 'friend1@example.com', ideas: [] }]`; asserts the same empty-state message is visible even though an active connection exists (FR-006; User Story 2 scenario 2).

**Checkpoint**: At this point, run `npm run test:tsx -- GiveList.test.tsx` — User Stories 1 AND 2 are both independently verified.

---

## Phase 5: User Story 3 - Give panel reflects current connections and ideas (Priority: P3)

**Goal**: Confirm the panel shows a loading state before data arrives, fails soft when one connection's fetch fails, and refetches when connections/ideas change between views.

**Independent Test**: Run `npm run test:tsx -- GiveList.test.tsx` — the test case(s) added below cover the loading state, the fail-soft partial-failure case, and rerenders that change the mocked connections/ideas.

- [X] T009 [US3] In `src/app/give/GiveList.test.tsx`, add a test case that mocks `findIdeasForConnections` to return a pending (never-resolving within the test) promise, renders `<GiveList>`, and asserts (synchronously, without `await`/`findBy*`) that neither the empty-state message nor any idea/header text is present (FR-007; `contracts/give-panel-ideas.md` row `isLoading === true`).
- [X] T010 [US3] In `src/app/give/GiveList.test.tsx`, add a test case that mocks `useConnections` to return `activeConnections: ['friend1@example.com', 'friend2@example.com']` and `findIdeasForConnections` to resolve `[{ email: 'friend1@example.com', ideas: [{ id: 'i1', title: 'Weekend Cabin Gift', description: '...' }] }, { email: 'friend2@example.com', ideas: [] }]` (simulating `friend2`'s fetch having failed inside `findIdeasForConnections`'s own fail-soft handling); asserts `'Weekend Cabin Gift'` and `'friend1@example.com'` are visible, `'friend2@example.com'` is absent as a header, and no error-message text is rendered anywhere (FR-009, SC-006).
- [X] T011 [US3] In `src/app/give/GiveList.test.tsx`, add a test case using the same fixed-`AppContext.Provider`-wrapper + `rerender` technique established in `src/app/Home.test.tsx` (not `renderWithAppContext`, so the root element type stays constant across `rerender` calls): first mock `activeConnections: []` / `findIdeasForConnections` resolving `[]` and render (empty-state message visible); then mock `activeConnections: ['friend1@example.com']` / `findIdeasForConnections` resolving one idea for that email, and call `rerender(...)` on the same instance; assert the idea now appears and the empty-state message is gone, without remounting (FR-008; User Story 3 scenario 1).
- [X] T012 [US3] In `src/app/give/GiveList.test.tsx`, add a test case mirroring T011 in reverse: start with `activeConnections: ['friend1@example.com']` and an idea showing, `rerender(...)` after changing the mocks to `activeConnections: []` / `findIdeasForConnections` resolving `[]`; assert the idea is gone and the empty-state message now appears (FR-008; User Story 3 scenario 2).

**Checkpoint**: All three user stories are now independently verified; every row of `contracts/give-panel-ideas.md`'s UI render contract is covered by `src/app/give/GiveList.test.tsx`.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Confirm the change is clean and doesn't regress anything outside this feature's direct scope.

- [X] T013 [P] Run `npm run test:tsx` (full suite, not just `GiveList.test.tsx`) and `npm run test:ci` from the repo root to confirm no regressions in `src/app/ideas/MyIdeas.test.tsx`, `src/app/ideas/AddIdea.test.tsx`, `src/app/Home.test.tsx`, or the Firestore rules tests (none of which this feature should affect, per the Constitution Check in `plan.md`). Note: `src/app/auth/SignInStub.test.tsx` is already failing on `main` for an unrelated, pre-existing reason (seed-data/test mismatch from a prior commit) — do not treat that specific failure as a regression from this feature.
- [X] T014 [P] Run `npx tsc --noEmit` from the repo root to confirm `src/app/ideas/IdeasService.ts`, `src/app/give/GiveList.tsx`, and `src/app/give/GiveList.test.tsx` introduce no new TypeScript errors and no `any` (constitution Principle I). Compare against the known pre-existing baseline of 5 unrelated errors in `App.tsx`/`src/app/permissions/Sharing.tsx` (confirmed pre-existing via `git stash` during `002-hide-invite-prompt`) — only new errors beyond that baseline count as a problem.
- [ ] T015 Execute the optional manual/Maestro smoke check described in `specs/003-give-panel-shared-ideas/quickstart.md` (Section 2) on the iPhone 17 (iOS 26.5) simulator via the `run-maestro-tests` skill — optional, not required to consider the feature complete since T001-T012 already cover the full contract, and unlike `002-hide-invite-prompt` this one needs no seed-data changes to try manually.

**Checkpoint**: Feature complete. `npm run test:tsx` and `npm run test:ci` pass (aside from the pre-existing unrelated `SignInStub` failure); no new TypeScript errors; `quickstart.md` expected outcomes met.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: None — no tasks.
- **Foundational (Phase 2)**: No dependencies beyond Setup — BLOCKS all user story test phases (T004-T012 all need `IdeasService.ts`'s `findIdeasForConnections`, `GiveList.tsx`'s render pipeline, and `GiveList.test.tsx`'s scaffold — including its `useFocusEffect` mock — from T001-T003 to exist first).
- **User Stories (Phase 3-5)**: All depend on Foundational (Phase 2) completion. Because all three stories' test cases live in the same file (`GiveList.test.tsx`) added by T003, they must be applied sequentially (T004 → T012) rather than as parallel edits, even though they are logically independent test cases. Recommended order is priority order (P1 → P2 → P3), matching the phase order below.
- **Polish (Phase 6)**: Depends on Phases 3-5 (all user story tests in place) — T013/T014 verify the whole feature; T015 is optional.

### User Story Dependencies

- **User Story 1 (P1)**: Depends only on Foundational. Fully verifiable on its own once T001-T006 are done — this is the MVP.
- **User Story 2 (P2)**: Depends only on Foundational (not on US1's test tasks) — verifies the empty-state branch of the same T001-T002 implementation.
- **User Story 3 (P3)**: Depends only on Foundational — verifies the loading, fail-soft, and refetch-on-focus behavior of the same T001-T002 implementation.

### Within Each User Story

- No separate models/endpoints layers apply beyond the one service function (T001) added in Foundational — each story phase is test-case-only, verifying behavior already implemented in Phase 2.

### Parallel Opportunities

- T001 (`IdeasService.ts`) and T003 (`GiveList.test.tsx` scaffold) touch different files and have no dependency on each other's *content*, but T002 (`GiveList.tsx`) depends on T001 existing (it imports `findIdeasForConnections`), and T003's mocks reference the same module path — in practice, do T001 → T002 → T003 in order.
- T004-T012 all edit the same file (`GiveList.test.tsx`) and must be applied sequentially, not in parallel, despite being logically independent test cases.
- T013 and T014 (Phase 6) touch no shared files and can run in parallel.

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

1. Complete Phase 2: Foundational (T001-T003) — this is also, unusually for this template, the entire code change.
2. Complete Phase 3: User Story 1 (T004-T006).
3. **STOP and VALIDATE**: `npm run test:tsx -- GiveList.test.tsx` passes the US1 cases — the requested behavior ("see other people's ideas that I have an accepted connection with") is proven.
4. This is already deployable — browsing connections' ideas is the entire user-facing ask; the empty state (US2) and refetch/fail-soft robustness (US3) are important but secondary polish on top of a working core.

### Incremental Delivery

1. Foundational (T001-T003) → the fetch/render pipeline exists, but only US1 is proven by tests so far.
2. Add User Story 1 tests (T004-T006) → MVP proven → could ship here.
3. Add User Story 2 tests (T007-T008) → empty-state coverage confirmed.
4. Add User Story 3 tests (T009-T012) → loading, fail-soft, and refetch-on-focus behavior confirmed.
5. Polish (T013-T015) → full-suite regression check, typecheck, optional manual smoke test.

Because T001-T002 implement all three stories' behavior in one pass (per `research.md`), "incremental delivery" here means incrementally adding *proof* (tests) rather than incrementally adding *behavior* — there is no partial-behavior state where, say, US1 works but US2/US3 don't, short of a bug.

### Parallel Team Strategy

Not particularly applicable to this feature's size — T001-T003 are inherently done by one person first (each depends on the previous), after which T004-T012's test cases could nominally be split across people, but since they share one file (`GiveList.test.tsx`), coordinating merge order would cost more than the single-developer sequential path.
