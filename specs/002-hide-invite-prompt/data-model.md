# Data Model: Hide Home Invite Prompt for Connected Users

This feature introduces **no new persisted entities and no changes to `types/DataStoreTypes.ts`**. It only reads existing data, via the existing `useConnections` hook, and derives one transient (non-persisted) view value from it.

## Existing entities consumed (unchanged)

### Connection (derived from `User.canView`)

Represented today as an entry in the `canView: string[]` array on a `users/{email}` Firestore document (see `types/DataStoreTypes.ts`'s `User` interface — `canView` isn't itself typed there but is read by `useConnections.ts` as `string[] | undefined`). Each email present in the signed-in user's own `canView` array is one active/accepted connection.

- **Relevant field**: `canView: string[]` on `users/{email}`
- **Used as**: `activeConnections` in `UseConnectionsResult` (`src/app/connections/useConnections.ts`)
- **Relevance to this feature**: `activeConnections.length` is the count this feature thresholds against (FR-001/FR-002). No filtering/transformation beyond what `useConnections` already does is needed.

### ConnectionRequest (existing, `types/DataStoreTypes.ts`)

```ts
interface ConnectionRequest {
  otherEmail: string,
  direction: 'incoming' | 'outgoing',
  createdAt: Timestamp | Date
}
```

- **Storage**: `users/{email}/connectionRequests/{otherEmail}` subcollection.
- **Relevance to this feature**: explicitly excluded from the invite-prompt threshold (FR-003) — this feature does not read `incomingRequests`/`outgoingRequests` from the hook at all, only `activeConnections` and `isLoading`.

## New derived (non-persisted) view state

### Invite Prompt Visibility

A boolean computed at render time in `Home.tsx`; never stored.

| Field | Type | Derivation | Rule reference |
|---|---|---|---|
| `shouldShowInvitePrompt` | `boolean` | `isLoading \|\| activeConnections.length <= 1` | FR-001, FR-002, FR-006 |

- **Inputs**: `isLoading: boolean` and `activeConnections: string[]` from `useConnections(appContext.userInfo?.email)`.
- **Lifecycle**: Recomputed on every render; since `useConnections` updates its state from a live `onSnapshot` listener, this value naturally updates as connections change while `Home.tsx` is mounted (FR-004), and defaults to `true` (fail open) until the listener's first successful snapshot arrives, or forever if it never does (spec Clarifications).
- **Not persisted**: This value lives only in the render of `Home.tsx`; no Firestore field, no local storage, no new state elsewhere.

## Relationships

No new relationships. `Home.tsx` becomes a second consumer of `useConnections` (the first being `ListConnections.tsx`), both reading the same `users/{email}` document and `connectionRequests` subcollection independently (each screen mounts its own instance of the hook, per constitution III's "managed subscriptions" pattern — no shared/global cache is introduced).
