# Research: Hide Home Invite Prompt for Connected Users

No items in Technical Context were marked `NEEDS CLARIFICATION` — this feature reuses existing, already-established patterns in the codebase. The decisions below record why those patterns were chosen over the alternatives for this specific feature, and were not the subject of a prior open question in `spec.md` (the one open question, initial-load/error behavior, was already resolved during `/speckit-clarify` and appears in spec.md's Clarifications section, not here).

## Decision: Reuse the existing `useConnections` hook rather than a new query or hook

**Rationale**: `src/app/connections/useConnections.ts` already exposes `activeConnections` (derived from the `users/{email}` doc's `canView` array — i.e., accepted connections only, matching the spec's "active (non-pending)" definition exactly) and `isLoading`, via a live `onSnapshot` listener registered in `useEffect` with cleanup. This is precisely the shape FR-001–FR-006 need, with zero new Firestore reads and no duplicate subscription.

**Alternatives considered**:
- *Write a new lightweight hook/query just for a count*: rejected — duplicates an existing subscription for no benefit, and risks the Home screen's notion of "active connection" drifting from the Connections tab's over time.
- *Compute the count with a one-off `getDocs()` call when Home gains focus*: rejected — would not update live while the screen is open (violates FR-004/User Story 3, which require the prompt to react to an acceptance or removal without an app restart).

## Decision: Fail-open (show prompt) is achieved by the hook's existing `isLoading` semantics, without adding an error field

**Rationale**: In `useConnections`, `isLoading` starts `true` and only flips to `false` inside the `users/{email}` `onSnapshot` success callback. If that listener instead errors, `isLoading` simply never becomes `false`, and — per the render rule below — the prompt stays visible indefinitely. This satisfies the spec's fail-open Clarification (FR-006) for both the "still loading" and "failed to load" cases without any new code path.

**Alternatives considered**:
- *Add an explicit `error` field to `useConnections`*: rejected as scope creep — no other consumer of the hook needs an error state today, and the existing stuck-`isLoading` behavior already satisfies the spec's requirement.

## Decision: Visibility rule is a single inline expression in `Home.tsx`, not a new hook/util

**Rationale**: `isLoading || activeConnections.length <= 1` directly encodes FR-001/002/006 in one boolean, used in exactly one place (`Home.tsx`). A dedicated hook or utility for a single boolean expression used once would be a premature abstraction.

**Alternatives considered**:
- *Extract a `useShouldShowInvitePrompt()` hook*: rejected — no second consumer exists; would add an indirection layer for no reuse benefit.

## Decision: Verify with a component-level Jest test, not a new Maestro e2e flow

**Rationale**: `MyIdeas.test.tsx` and `AddIdea.test.tsx` establish the repo's convention for this class of change: mock the data-fetching module (here, `useConnections`) and assert on rendered output via `@testing-library/react-native` + `renderWithAppContext`. This runs fast, requires no simulator/emulator, and directly covers FR-001/002/006 (0, 1, 2+ connections, and the loading state) as isolated cases. A new Maestro flow would additionally require seeding a second active-connection fixture in `util/dataSeed.ts` and `util/seedFirestore.ts`, which is unnecessary for a render-condition change with no new interaction flow.

**Alternatives considered**:
- *Cover this solely via a new/extended Maestro flow*: rejected as the primary verification method — slower, requires simulator + emulator + seed-data changes, and existing e2e flows (`maestro/*.yaml`) don't currently exercise a multi-connection state. Still noted as an optional manual smoke check in `quickstart.md`.

**Output**: All Technical Context items are resolved by decisions above; no unresolved unknowns remain going into Phase 1.
