# Feature Specification: Hide Home Invite Prompt for Connected Users

**Feature Branch**: `002-hide-invite-prompt`

**Created**: 2026-09-10

**Status**: Draft

**Input**: User description: "do not show the invite someone to your ideas message and button on home page if i have more than one connection that is not pending"

## Clarifications

### Session 2026-09-10

- Q: What should the Home screen show while the user's active-connection count is not yet known (e.g., still loading, or failed to load)? → A: Show the invite prompt by default until the count is confirmed to be 1+ (fail open — same as today's behavior)
- Update: The hide threshold was lowered from "more than one" (2+) active connections to "one or more" (1+) active connections — the prompt now hides as soon as the user has a single active connection, and only shows for users with zero active connections.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Hide the invite prompt as soon as the user has any connection (Priority: P1)

A user who already has at least one active (accepted) connection opens the Home screen. Since they already have someone to share ideas with, they should not be nagged with a prompt to invite someone new.

**Why this priority**: This is the core behavior change requested — it directly reduces unnecessary/irrelevant messaging for users who no longer need it.

**Independent Test**: Can be fully tested by signing in as a user with exactly 1 active connection, opening the Home screen, and confirming the invite message and button are not present.

**Acceptance Scenarios**:

1. **Given** the signed-in user has exactly 1 active (non-pending) connection, **When** they open the Home screen, **Then** the "invite someone to your ideas" message and its button are not shown.
2. **Given** the signed-in user has 2 or more active (non-pending) connections, **When** they open the Home screen, **Then** the "invite someone to your ideas" message and its button are not shown.

---

### User Story 2 - Keep showing the invite prompt to users with no connections (Priority: P2)

A brand-new user with zero active connections opens the Home screen. They still benefit from being encouraged to connect with someone, so the existing prompt and button continue to appear for them.

**Why this priority**: Preserves current behavior for the one group that still needs the nudge; without this the feature could accidentally hide the prompt for every user, including those who have no one to share ideas with yet.

**Independent Test**: Can be fully tested by signing in as a user with 0 connections, opening the Home screen, and confirming the invite message and button appear.

**Acceptance Scenarios**:

1. **Given** the signed-in user has 0 active connections, **When** they open the Home screen, **Then** the "invite someone to your ideas" message and button are shown.

---

### User Story 3 - Prompt visibility stays current as connections change (Priority: P3)

A user's active connection count changes while using the app — a pending request they sent gets accepted (taking them from 0 to 1 active connection), or they remove their only connection (dropping them back to 0). The Home screen's invite prompt reflects their current connection count rather than a stale one.

**Why this priority**: Ensures the feature behaves correctly over time and not just on first load; lower priority because it's a consequence of correctly implementing User Stories 1 and 2 rather than new distinct logic.

**Independent Test**: Can be fully tested by starting a user at 0 active connections (prompt visible), accepting a connection request to bring them to 1 (prompt becomes hidden), then removing that connection to bring them back to 0 (prompt becomes visible again).

**Acceptance Scenarios**:

1. **Given** the signed-in user has 0 active connections and views the Home screen, **When** a connection request is accepted, bringing them to 1 active connection, **Then** the invite message and button are no longer shown without requiring the app to be restarted.
2. **Given** the signed-in user has 1 active connection and the invite prompt is hidden, **When** that connection is removed, leaving 0 active connections, **Then** the invite message and button are shown again without requiring the app to be restarted.

### Edge Cases

- A user has 0 active connections plus one or more pending (sent or received) requests: the invite prompt still shows, since pending requests do not count toward the threshold.
- A user has 1 or more active connections and also has pending requests: the invite prompt stays hidden; pending requests do not affect the count either way.
- A user declines or cancels a pending request: this has no effect on prompt visibility, since pending requests were never counted.
- The Home screen is opened before the active-connection count has finished loading, or the count fails to load: the invite prompt is shown by default (fail open) until/unless the count is confirmed to be 1 or more.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST show the "invite someone to your ideas" message and its accompanying button on the Home screen when the signed-in user has zero active (non-pending) connections.
- **FR-002**: System MUST hide the "invite someone to your ideas" message and its accompanying button on the Home screen when the signed-in user has one or more active (non-pending) connections.
- **FR-003**: System MUST exclude pending connection requests — whether sent by the user or received from someone else — from the count used to decide invite-prompt visibility.
- **FR-004**: System MUST re-evaluate invite-prompt visibility whenever the user's active connection count changes (e.g., a request is accepted or a connection is removed), reflecting the current count without requiring an app restart.
- **FR-005**: When the invite prompt is hidden, the rest of the Home screen (e.g., the welcome message) MUST continue to display normally.
- **FR-006**: System MUST default to showing the invite prompt (fail open) whenever the active-connection count is not yet known — including while it is still loading on screen open, and if it fails to load — and only hide the prompt once the count is confirmed to be one or more.

### Key Entities

- **Connection**: A mutual link between the signed-in user and another user that grants them view access to each other's ideas. Only connections in the active/accepted state count toward the invite-prompt threshold.
- **Connection Request**: A pending, not-yet-accepted invitation between two users (sent or received). Distinct from a Connection; excluded from the invite-prompt threshold regardless of direction.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of users with 1 or more active connections no longer see the invite prompt on the Home screen.
- **SC-002**: 100% of users with 0 active connections continue to see the invite prompt on the Home screen.
- **SC-003**: Invite-prompt visibility matches the user's current active-connection count in every observed Home screen view, including immediately after a connection is accepted or removed, with no stale/incorrect state requiring an app restart.
- **SC-004**: The presence of any number of pending connection requests never changes whether the invite prompt is shown or hidden.
- **SC-005**: The invite prompt is visible by default on every Home screen open before the active-connection count is confirmed (including if it fails to load), and is hidden only once the count is confirmed to be one or more.

## Assumptions

- "Connection that is not pending" refers to an active/accepted connection (mutual view access already granted), as distinct from an outgoing or incoming pending connection request.
- "One or more" means a threshold of exactly 1 (inclusive); a user with precisely 1 active connection already has the prompt hidden, and only 0 active connections shows it.
- The Home screen already has access to (or can obtain) the current user's active connection count, since equivalent connection data is already used elsewhere in the app (e.g., the Connections tab).
- Visibility should update live/in near-real-time as the user's connection count changes, consistent with how connection state already updates elsewhere in the app, rather than only being computed once when the app starts.
- No replacement content is required in the space where the invite message and button previously appeared — they are simply omitted, and surrounding content is unaffected.
