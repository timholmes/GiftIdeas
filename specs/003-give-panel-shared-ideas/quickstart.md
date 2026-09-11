# Quickstart: Validate Show Connections' Ideas on the Give Panel

**Feature**: [spec.md](./spec.md) | **Data model**: [data-model.md](./data-model.md) | **Contracts**: [contracts/give-panel-ideas.md](./contracts/give-panel-ideas.md)

## Prerequisites

- `npm install` at repo root.
- No Firebase emulators are required for the primary (automated) verification below, since `GiveList.test.tsx` mocks `useConnections` and `findIdeasForConnections` directly rather than hitting Firestore.

## 1. Automated verification (primary)

```bash
npm run test:tsx
```

This runs `GiveList.test.tsx` against [contracts/give-panel-ideas.md](./contracts/give-panel-ideas.md)'s UI render contract: loading state, empty state (0 active connections, and active connections with no ideas), grouped display across multiple connections, the signed-in user's own ideas never appearing, and the fail-soft partial-failure case (one connection's ideas present, another's `ideas: []` after a simulated fetch failure).

`npm run test:ci` runs this alongside the rules tests in the order CI expects (no rules changes are expected for this feature).

## 2. Manual / Maestro smoke check (optional)

Unlike `002-hide-invite-prompt`, no seed data changes are needed for this one: `util/dataSeed.ts` already gives every seeded user (`me@example.com`, `friend1@example.com`, `friend2@example.com`) the same 2 ideas ("Weekend Cabin Gift", "Coffee Subscription"). Any accepted connection between two seeded users is enough to see the feature working end-to-end.

1. `npm run backend:start` (starts emulators and seeds the 3 users, each with their 2 ideas).
2. Sign in as one seeded user and connect them to another via the existing Add Connection flow (Connections tab), then accept the request from the other side (or use the existing `maestro/connections.yaml` flow as a reference for the request/accept steps).
3. Run via the `run-maestro-tests` skill against the iPhone 17 (iOS 26.5) simulator, per constitution:
   - **Before any connection is accepted**: open the Give tab, confirm the empty-state message is shown (User Story 2).
   - **After the connection is accepted**: return to the Give tab, confirm the connected user's 2 ideas now appear, grouped under their email (User Story 1).
   - **After removing that connection** (via the Connections tab's swipe-to-delete): return to the Give tab, confirm their ideas are no longer shown (User Story 3).
   - Confirm the signed-in user's own 2 ideas never appear on their own Give tab, even though they exist under "My Ideas" (User Story 1, scenario 3).

This manual pass is optional — it isn't required to consider the feature done, since the component test in Step 1 already covers every row of the render contract deterministically, including the fail-soft case that's awkward to trigger live. No new/changed `maestro/*.yaml` flow is required by this feature.

## Expected outcome

- `npm run test:tsx` passes with new assertions covering all rows of [contracts/give-panel-ideas.md](./contracts/give-panel-ideas.md)'s UI render contract.
- If the optional manual pass is run, all four bullets in Step 2.3 match their corresponding acceptance scenarios in [spec.md](./spec.md) (User Stories 1–3), and SC-001 through SC-006 are observably met.
