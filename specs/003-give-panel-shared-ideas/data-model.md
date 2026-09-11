# Data Model: Show Connections' Ideas on the Give Panel

This feature introduces **no changes to `types/DataStoreTypes.ts`** and no new Firestore collections or fields. It reads existing data (each active connection's `ideas` subcollection, and the existing connections list) and derives one new, non-persisted grouping shape used only within the Give panel.

## Existing entities consumed (unchanged)

### Idea (existing, `types/DataStoreTypes.ts`)

```ts
interface Idea {
  id?: string,
  title: string,
  description: string
}
```

- **Storage**: `users/{email}/ideas/{ideaId}` — one subcollection per user, already used by "My Ideas".
- **Relevance to this feature**: read from each active connection's `users/{email}/ideas` subcollection via the existing `findAllIdeas(email)` (`src/app/ideas/IdeasService.ts`), unchanged. This feature never reads or writes the signed-in user's own `ideas` subcollection (FR-004).

### Connection (derived from `User.canView`, existing — see `002-hide-invite-prompt`'s data-model.md)

- **Relevant field**: `canView: string[]` on `users/{email}`, exposed as `activeConnections: string[]` by `useConnections` (`src/app/connections/useConnections.ts`).
- **Relevance to this feature**: the list of emails this feature fetches ideas for. No pending `ConnectionRequest` entities are read by this feature at all (FR-002).

## New derived (non-persisted) shape

### ConnectionIdeas

A new TypeScript interface (added to `src/app/ideas/IdeasService.ts`, alongside `Idea`'s existing home) representing one connection's fetch outcome. Not stored — exists only in memory for the duration of `GiveList`'s render.

```ts
interface ConnectionIdeas {
  email: string;      // the connection's email — the group/section header (FR-003)
  ideas: Idea[];       // that connection's ideas, or [] if none/fetch failed for this email
}
```

| Field | Type | Derivation | Rule reference |
|---|---|---|---|
| `email` | `string` | One entry per email in `activeConnections` | FR-001, FR-003 |
| `ideas` | `Idea[]` | Result of `findAllIdeas(email)` for that email; `[]` if that specific call rejected (fail-soft) | FR-001, FR-005, FR-009 |

**Lifecycle**: Computed by a new `findIdeasForConnections(emails: string[]): Promise<ConnectionIdeas[]>` function in `IdeasService.ts`, called from `GiveList.tsx`'s `useFocusEffect`. Recomputed (refetched) every time the Give panel gains focus (FR-008), not continuously streamed.

**Fail-soft behavior (FR-009)**: `findIdeasForConnections` uses `Promise.allSettled` internally — a rejected `findAllIdeas(email)` call for one connection becomes `{ email, ideas: [] }` (logged, not surfaced), rather than rejecting the whole batch. A connection entry with an empty `ideas` array (whether genuinely no ideas, or a failed fetch) is simply not rendered as a group, per the "grouped by connection" display decision in `research.md` — both cases look identical to the user (nothing shown for that connection), which is consistent with FR-009's "no visible error message."

## Relationships

No new relationships. `GiveList.tsx` becomes a second consumer of `useConnections` (alongside `Home.tsx` and `ListConnections.tsx`) and a second consumer of `findAllIdeas` (alongside `MyIdeas.tsx`, which only ever calls it with the signed-in user's own email). Each screen mounts its own instances of these — no shared/global cache is introduced, consistent with constitution III's per-screen "managed subscriptions" pattern (even though this feature's own ideas fetch is not itself a subscription — see `research.md`).
