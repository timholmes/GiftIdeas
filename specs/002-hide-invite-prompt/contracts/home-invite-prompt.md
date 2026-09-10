# UI Contract: Home Invite Prompt Visibility

This feature has no network/API surface (no Cloud Function or Firestore rule changes). Its only "interface" is a render contract between the Home screen and the data it already reads via `useConnections`. This doc is that contract, so it can be verified directly by the component test (`Home.test.tsx`) called for in `plan.md` / `tasks.md`.

## Inputs

| Input | Source | Type |
|---|---|---|
| `isLoading` | `useConnections(appContext.userInfo?.email)` | `boolean` |
| `activeConnections` | `useConnections(appContext.userInfo?.email)` | `string[]` |

## Output

| Output | Type | Rule |
|---|---|---|
| Invite message + button rendered | `boolean` (presence/absence of the two elements) | `isLoading \|\| activeConnections.length <= 1` |

## Truth table

| `isLoading` | `activeConnections.length` | Invite message + button shown? | Spec reference |
|---|---|---|---|
| `true` | (any) | Yes | FR-006 (fail open while loading) |
| `false` | `0` | Yes | FR-001 |
| `false` | `1` | Yes | FR-001 |
| `false` | `2` | No | FR-002 |
| `false` | `3+` | No | FR-002 |

## Explicitly out of contract

- `incomingRequests` / `outgoingRequests` (pending requests, in either direction) are **not** inputs to this rule at all (FR-003) — they must not appear in the visibility expression.
- No new Firestore listener may be created to serve this contract; it must be satisfied entirely from an existing `useConnections(...)` call in `Home.tsx`.
- No distinct "error" UI state exists — an errored listener is indistinguishable from "still loading" (`isLoading` stays `true`), and both resolve to "show the prompt."
- The rest of the Home screen (welcome message) is unaffected by this rule (FR-005) — this contract governs only the invite message + button.
