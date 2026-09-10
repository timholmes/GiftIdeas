# Quickstart: Validate Add Connection by Email

**Feature**: [spec.md](./spec.md) | **Data model**: [data-model.md](./data-model.md) | **Contracts**: [contracts/](./contracts/)

## Prerequisites

- `npm install` at repo root, `cd functions && npm install` for the
  Functions package.
- Firebase emulators available (Auth, Firestore, Functions) — this repo's
  `scripts/start-emulators.sh`.
- Two distinct signed-in test accounts (e.g. via the existing
  `test/auth/StubUsers.ts` fixtures) to act as sender and recipient.

## 1. Start the backend emulators

```bash
npm run backend:start
```

## 2. Automated verification (rules + functions)

```bash
npm run test:rules   # extend with the connectionRequests cases from
                      # contracts/firestore-schema.md before this passes
npm run test:tsx      # component/unit coverage for the new UI pieces
```

`npm run test:ci` runs both in the order CI expects.

## 3. Manual / Maestro end-to-end walkthrough

Run via the `run-maestro-tests` skill against the iPhone 17 (iOS 26.5)
simulator, per constitution. The flow to script/validate:

1. **Sign in as User A.** Navigate to the connections screen; confirm the
   empty state renders (User Story 4, scenario 4).
2. **Send a request.** Open "Add Connection", enter User B's email, submit.
   Confirm the request appears in User A's list marked pending (User Story
   1, scenario 1) — within the 2-second budget of SC-004, with no manual
   refresh.
3. **Validate blocked attempts** (User Story 3): re-submit User B's email
   (duplicate/pending → specific message), submit User A's own email
   (self-add → specific message), submit a syntactically valid but
   unregistered email (generic message, per the enumeration-safety
   contract).
4. **Cancel.** From User A's list, cancel the pending request; confirm it
   disappears from A's list (User Story 1, scenario 4).
5. **Send again, then respond as User B.** Re-send the request from A to
   B. Sign in as User B; open the connections list; confirm the incoming
   request appears with accept/decline actions (User Story 4, scenario 3).
6. **Accept.** Accept as User B; confirm both A and B now see an active
   connection and neither shows a pending entry for the other (User Story
   2, scenario 1); confirm mutual visibility — B can now see A's ideas and
   vice versa (FR-008).
7. **Decline path (separate run).** Repeat steps 2 and 5, but decline as
   User B instead of accepting; confirm no connection is created and the
   entry silently disappears from both lists, with no distinct "declined"
   notice surfaced to A (User Story 2, scenario 2).
8. **Simultaneous mutual request (optional, edge case).** With no pending
   request between A and C, have A send a request to C, then — before C
   responds — have C send a request to A. Confirm this resolves directly
   to an active connection rather than two pending entries (spec
   Assumptions / Edge Cases).

## Expected outcome

All eight scenarios above match their corresponding acceptance scenarios in
[spec.md](./spec.md); SC-001 through SC-005 are observably met (timing,
message clarity, first-attempt success, live updates, single-action
accept/decline).
