# Contract: Firestore schema & security rules delta

## New subcollection

`users/{ownerEmail}/connectionRequests/{otherEmail}`

```ts
{
  direction: "incoming" | "outgoing",
  otherEmail: string,
  createdAt: Timestamp
}
```

See [../data-model.md](../data-model.md) for full field/lifecycle detail.

## `firestore.rules` addition

Add a new `match` block alongside the existing `users/{email}/ideas/{document=**}`
block in `firestore.rules`, reusing the existing `loggedInAndMine` helper:

```
match /users/{email}/connectionRequests/{document=**} {
  allow read: if loggedInAndMine(email);
  // No client write rule: all writes go through the Cloud Functions in
  // functions.md, using the Admin SDK, which is not subject to these rules.
  // This keeps request creation/acceptance/decline/cancel fully
  // server-validated per constitution principle II.
}

match /users/{email} {
  allow read, write: if loggedInAndMine(email);
}
```

**Correction found during implementation**: the previously-existing catch-all
block was `match /users/{email}/{document=**} { allow read, write: if
loggedInAndMine(email); }` — a *recursive* wildcard that also matches
`connectionRequests/**`. Firestore evaluates all matching `match` blocks for
a path and allows the request if *any* of them grant it (rules are OR'd,
never overridden by a more specific block), so leaving that block recursive
would have silently re-granted client write access to
`connectionRequests` regardless of the new block above. The catch-all was
therefore narrowed to match only the exact `users/{email}` document (no
trailing `{document=**}`), preserving today's read/write access to the top-
level user document (e.g. `canView`) while no longer recursing into
subcollections. This does not change the existing
`users/{email}/ideas/{document=**}` block or the `canView`/
`canViewIdeasGranted` mutual-access mechanism — `ideas` already had its own
explicit block, so it is unaffected by narrowing the catch-all.

## Error message wording (enumeration-safety contract, FR-004)

The `sendConnectionRequest` function's outward-facing message for "no such
account" and any other rejection **MUST** read identically regardless of
the underlying reason where distinguishing them would reveal account
existence. Concretely: the message shown to the user for "no account with
that email" MUST be the same generic wording as any other
`sendConnectionRequest` failure that isn't self-add or duplicate/pending
(those two remain specific, since they don't leak information about a
*third party*'s registration status — the caller already knows their own
email and their own existing connections/requests).

## Test coverage required (constitution II)

- `test/firebase.rules.*.spec.ts` MUST gain cases asserting:
  - A user can read their own `connectionRequests` subcollection.
  - A user cannot read another user's `connectionRequests` subcollection.
  - A client-side write attempt to `connectionRequests` (bypassing the
    Cloud Function) is denied by the rules.
