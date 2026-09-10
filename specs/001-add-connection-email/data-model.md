# Phase 1 Data Model: Add Connection by Email

**Feature**: [spec.md](./spec.md) | **Research**: [research.md](./research.md)

## Entities

### User Account (existing, unchanged)

Firestore document at `users/{email}` (document ID **is** the lowercased,
trimmed email address — the existing primary-key convention in this repo).

| Field | Type | Notes |
|---|---|---|
| `firstName` | `string` | existing |
| `email` | `string` | existing; matches doc ID |
| `sub` | `string?` | existing |
| `email_verified` | `boolean?` | existing |
| `canView` | `string[]` | existing — emails granted mutual view access (see Connection below) |

TypeScript type: `types/DataStoreTypes.ts` `User` (no changes required).

### Connection (existing mechanism, new mutual semantics)

Not a separate document — represented by **reciprocal membership** in two
users' `canView` arrays. A Connection between `a@x.com` and `b@x.com` exists
when *both* of the following are true:

- `users/a@x.com.canView` contains `b@x.com`
- `users/b@x.com.canView` contains `a@x.com`

**Lifecycle**: created only by `acceptConnectionRequest` (never directly);
no explicit removal capability is in scope for this feature (per spec
Assumptions — the existing single-directional
`deleteConnectionByEmail` remains available but is out of scope for this
feature and should be revisited separately since it currently only removes
one direction).

### Connection Request (new)

Firestore subcollection documents at
`users/{ownerEmail}/connectionRequests/{otherEmail}`. Every pending request
exists as **two** documents — one under each participant — written and
deleted together by the Cloud Functions in [contracts/functions.md](./contracts/functions.md).

| Field | Type | Notes |
|---|---|---|
| `direction` | `"incoming" \| "outgoing"` | `"outgoing"` on the sender's copy, `"incoming"` on the recipient's copy |
| `otherEmail` | `string` | redundant with doc ID; included so client reads don't need to parse the doc ID |
| `createdAt` | `Timestamp` | server timestamp, set on creation |

**Identity/uniqueness**: the document ID (`otherEmail`) guarantees at most
one pending request per ordered pair from either party's perspective — this
is what satisfies FR-005 (no duplicate requests) structurally rather than
via an extra query.

**Lifecycle / state transitions**:

```
(no request)
   │  sendConnectionRequest(target)
   │  [if target has no pending incoming request from me AND no existing
   │   connection with me]
   ▼
pending (outgoing doc @ sender, incoming doc @ recipient)
   │                              │                         │
   │ acceptConnectionRequest      │ declineConnectionRequest│ cancelConnectionRequest
   │ (called by recipient)       │ (called by recipient)   │ (called by sender)
   ▼                              ▼                         ▼
both docs deleted;         both docs deleted            both docs deleted
canView updated mutually   (no connection created)       (no connection created)
   │
   ▼
(no request) — Connection now exists via canView
```

**Special case — mutual simultaneous requests** (per spec Assumptions): if
`sendConnectionRequest` is called by B targeting A, and A already has an
`outgoing` request to B (equivalently B already has an `incoming` request
from A), the function short-circuits into the same effect as
`acceptConnectionRequest`: both pending docs are deleted and `canView` is
updated mutually, rather than creating a second pending pair.

TypeScript type (new, to be added to `types/DataStoreTypes.ts`):

```ts
export declare interface ConnectionRequest {
    otherEmail: string;
    direction: 'incoming' | 'outgoing';
    createdAt: FirebaseFirestore.Timestamp | Date;
}
```

## Validation rules (enforced server-side, per constitution II)

- `otherEmail` MUST be a syntactically valid, normalized (lowercased,
  trimmed) email address.
- `otherEmail` MUST NOT equal the caller's own authenticated email
  (FR-003).
- A `users/{otherEmail}` document MUST exist for `sendConnectionRequest` to
  succeed; otherwise the call fails with a generic error that does not
  reveal whether the account exists (FR-004).
- `sendConnectionRequest` MUST fail if an active Connection already exists
  with `otherEmail`, or if an outgoing request to `otherEmail` already
  exists (FR-005) — unless the mutual-request short-circuit above applies.
- `acceptConnectionRequest` / `declineConnectionRequest` MUST fail if no
  matching `incoming` request document exists for the caller.
- `cancelConnectionRequest` MUST fail if no matching `outgoing` request
  document exists for the caller.

## Firestore security rules delta

See [contracts/firestore-schema.md](./contracts/firestore-schema.md) for
the exact rule addition. Summary: authenticated users may **read** only
their own `connectionRequests` subcollection
(`loggedInAndMine(email)`, matching the existing pattern); no client
**write** rule is added, since all writes happen through Cloud Functions
using the Admin SDK (which bypasses security rules by design) — this keeps
request creation/acceptance/decline/cancellation fully server-validated,
per constitution II.
