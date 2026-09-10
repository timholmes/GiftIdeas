# Quickstart: Validate Hide Home Invite Prompt for Connected Users

**Feature**: [spec.md](./spec.md) | **Data model**: [data-model.md](./data-model.md) | **Contracts**: [contracts/home-invite-prompt.md](./contracts/home-invite-prompt.md)

## Prerequisites

- `npm install` at repo root.
- No Firebase emulators are required for the primary (automated) verification below, since `Home.test.tsx` mocks `useConnections` directly rather than hitting Firestore.

## 1. Automated verification (primary)

```bash
npm run test:tsx
```

This runs `Home.test.tsx` against the [contracts/home-invite-prompt.md](./contracts/home-invite-prompt.md) truth table: for each of `isLoading=true`, `activeConnections.length` of `0`, `1`, `2`, confirm the invite message ("To invite someone to your ideas, click below.") and its "Add" button are present or absent as specified in FR-001/FR-002/FR-006.

`npm run test:ci` runs this alongside the rules tests in the order CI expects (no rules changes are expected to be needed for this feature, so `npm run test:rules` should be unaffected).

## 2. Manual / Maestro smoke check (optional)

The existing seed data (`util/dataSeed.ts`) has only two users (`tim@example.com`, `alex@example.com`), so Tim can reach at most **one** active connection from seed data alone — enough to confirm the prompt still shows (User Story 2), but not enough to confirm it hides (User Story 1), which needs a second distinct connection. If a manual walkthrough of the "hide" case is wanted:

1. `npm run backend:start` (starts emulators and seeds Tim + Alex as connected or connectable, per existing `001-add-connection-email` flows).
2. Add a third test account (either extend `util/dataSeed.ts` temporarily, or sign up a throwaway account through the app) and connect Tim to it via the existing Add Connection flow (`maestro/connections.yaml` / the Connections tab), so Tim now has 2 active connections.
3. Run via the `run-maestro-tests` skill against the iPhone 17 (iOS 26.5) simulator, per constitution:
   - **With 0 or 1 active connections**: open the Home tab, confirm "To invite someone to your ideas, click below." and the "Add" button are visible (User Story 2).
   - **After reaching 2 active connections**: return to the Home tab, confirm the message and button are gone, while "Welcome, Tim." still renders normally (User Story 1, FR-005).
   - **Remove one connection** (via the Connections tab's swipe-to-delete) to drop back to 1: return to Home, confirm the message and button reappear without restarting the app (User Story 3).

This manual pass is optional — it isn't required to consider the feature done, since the component test in Step 1 already covers all rows of the truth table deterministically. No new/changed `maestro/*.yaml` flow is required by this feature (see research.md).

## Expected outcome

- `npm run test:tsx` passes with new assertions covering all five truth-table rows in [contracts/home-invite-prompt.md](./contracts/home-invite-prompt.md).
- If the optional manual pass is run, all three bullets in Step 2.3 match their corresponding acceptance scenarios in [spec.md](./spec.md) (User Stories 1–3), and SC-001 through SC-005 are observably met.
