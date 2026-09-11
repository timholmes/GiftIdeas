# Contract: Give Panel Connections' Ideas

This feature has no network/API surface of its own (no Cloud Function, no rules change) — its interfaces are (1) a new internal service function's behavior contract, and (2) a UI render contract for the Give panel. Both are captured here so they can be verified directly by `GiveList.test.tsx`.

## 1. Service function contract: `findIdeasForConnections`

**Location**: `src/app/ideas/IdeasService.ts`

```ts
function findIdeasForConnections(emails: string[]): Promise<ConnectionIdeas[]>
```

| Input | Behavior |
|---|---|
| `emails: []` | Resolves to `[]` immediately — no reads performed. |
| `emails: [e1, e2, ...]`, all reads succeed | Resolves to one `ConnectionIdeas` per input email, in the same order as `emails`, each with that email's actual ideas (possibly `[]` if that user genuinely has none). |
| `emails: [e1, e2]`, `e1`'s read succeeds, `e2`'s read rejects (e.g. permission-denied, network error) | Resolves (never rejects) to `[{ email: e1, ideas: [...] }, { email: e2, ideas: [] }]` — the failure for `e2` is caught internally and logged, not thrown to the caller. |
| `emails` where every read rejects | Resolves to `[{ email: e1, ideas: [] }, { email: e2, ideas: [] }, ...]` — never rejects the whole call. |

**Guarantee**: This function never rejects/throws for a per-connection failure — the promise it returns always resolves. This is what makes the fail-soft behavior in FR-009/SC-006 possible without try/catch in the caller (`GiveList.tsx`).

## 2. UI render contract: Give panel display

**Inputs** (from `GiveList.tsx`'s own state, populated via `useConnections` and `findIdeasForConnections` on focus):

| Input | Source | Type |
|---|---|---|
| `activeConnections` | `useConnections(appContext.userInfo?.email)` | `string[]` |
| `connectionIdeas` | `findIdeasForConnections(activeConnections)`, held in local state | `ConnectionIdeas[]` |
| `isLoading` | Local state: `true` from focus until the `findIdeasForConnections` promise resolves | `boolean` |

**Output rules**:

| Condition | Give panel shows |
|---|---|
| `isLoading === true` | Neither the list nor the empty-state message — a loading state (FR-007). Does not show the empty-state message even though no ideas are rendered yet. |
| `isLoading === false` AND every `connectionIdeas[i].ideas` is empty (includes the `activeConnections.length === 0` case, since `connectionIdeas` is then `[]`) | The empty-state message (FR-006), no list. |
| `isLoading === false` AND at least one `connectionIdeas[i].ideas` is non-empty | One section per connection with a non-empty `ideas` array, headed by that connection's email (FR-003), listing each idea's title and description (FR-005). Connections with an empty `ideas` array (whether truly empty or failed to fetch — see service contract above) render no section at all — not an empty section, not an error. |

## Explicitly out of contract

- The signed-in user's own ideas are never part of `connectionIdeas` — `findIdeasForConnections` is only ever called with `activeConnections` (which excludes the signed-in user by construction), never with the signed-in user's own email (FR-004).
- Pending (incoming or outgoing) connection requests are not inputs to this contract at all — only `activeConnections` is used, never `incomingRequests`/`outgoingRequests` from `useConnections` (FR-002).
- No distinct visible "error" state exists in this contract — a fully-failed fetch (every connection's read rejects) renders identically to "confirmed no ideas" (FR-006, FR-009), and a partially-failed fetch renders identically to "that connection has no ideas" for the failed one(s) only.
- This contract covers viewing only — no claim/mark/comment interaction contract exists for this feature (spec Assumptions).
