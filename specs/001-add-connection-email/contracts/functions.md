# Contract: Cloud Functions (callable)

All four functions are Firebase `onCall` functions in `functions/src/index.ts`,
following the existing `addConnection` function's shape (auth check first,
then input validation, then normalization, then Firestore access). They are
invoked from the client via `httpsCallable`, matching
`ConnectionsService.ts`'s existing pattern.

Common error codes used below are Firebase `HttpsError` codes
(`unauthenticated`, `invalid-argument`, `failed-precondition`,
`permission-denied`, `not-found`, `already-exists`), matching the codes
already used in `addConnection`.

## `sendConnectionRequest`

Replaces the current `addConnection` function's behavior (kept as the same
export name is acceptable, or renamed — an implementation decision for
`/speckit-tasks`/`/speckit-implement`, not fixed here).

**Request**:
```ts
{ targetEmail: string }
```
(`currentUserEmail` is no longer needed as an input — it MUST be derived
from `request.auth.token.email`, closing the previous implicit trust of a
client-supplied value for the *acting* user's own identity.)

**Response** (success):
```ts
{ status: 'pending' } | { status: 'connected' } // 'connected' only for the mutual-request short-circuit
```

**Errors**:
- `unauthenticated` — no authenticated user.
- `invalid-argument` — `targetEmail` missing or not a syntactically valid email.
- `failed-precondition` — `targetEmail` normalizes to the caller's own email (FR-003).
- `not-found` (generic, enumeration-safe message per FR-004) — no `users/{targetEmail}` document exists. **The error message text MUST NOT distinguish this case from other failures in a way that confirms/denies account existence** — see [firestore-schema.md](./firestore-schema.md) note on message wording.
- `already-exists` — an active Connection or an outgoing pending request to `targetEmail` already exists (FR-005).

## `acceptConnectionRequest`

**Request**:
```ts
{ fromEmail: string } // the sender's email, i.e. the incoming request's doc ID
```

**Response**: `{ success: true }`

**Effect**: deletes `users/{me}/connectionRequests/{fromEmail}` and
`users/{fromEmail}/connectionRequests/{me}`; adds `me` to
`users/{fromEmail}.canView` and `fromEmail` to `users/{me}.canView` (both
via `arrayUnion`, in the same batch).

**Errors**:
- `unauthenticated`
- `invalid-argument` — `fromEmail` missing/malformed
- `not-found` — no matching `incoming` request exists for the caller from `fromEmail`

## `declineConnectionRequest`

**Request**:
```ts
{ fromEmail: string }
```

**Response**: `{ success: true }`

**Effect**: deletes both mirrored request documents (same pair as accept);
does **not** touch `canView`; performs no action that would let the sender
distinguish "declined" from "canceled" through Cloud Function output (the
client-visible effect is that the pending entry disappears from the
sender's list — see spec Clarifications).

**Errors**: same as `acceptConnectionRequest`.

## `cancelConnectionRequest`

**Request**:
```ts
{ toEmail: string } // the recipient's email, i.e. the outgoing request's doc ID
```

**Response**: `{ success: true }`

**Effect**: deletes `users/{me}/connectionRequests/{toEmail}` and
`users/{toEmail}/connectionRequests/{me}`; does not touch `canView`.

**Errors**:
- `unauthenticated`
- `invalid-argument` — `toEmail` missing/malformed
- `not-found` — no matching `outgoing` request exists for the caller to `toEmail`
