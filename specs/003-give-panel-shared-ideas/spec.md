# Feature Specification: Show Connections' Ideas on the Give Panel

**Feature Branch**: `003-give-panel-shared-ideas`

**Created**: 2026-09-10

**Status**: Draft

**Input**: User description: "on the give panel i should see other people's ideas that i have a accepted connection with"

## Clarifications

### Session 2026-09-10

- Q: What should the Give panel do if it fails to load ideas — either the whole fetch fails, or just one connection's ideas fail to load while others succeed? → A: Fail soft per-connection: skip any connection whose ideas fail to load, show ideas from the rest, log the error — no visible error message (matches the existing "My Ideas" screen's established pattern)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse connected people's gift ideas (Priority: P1)

A user who has one or more accepted (active) connections opens the Give panel to find gift ideas for the people they're connected with. They see the ideas each of their connections has added, so they know what to consider giving.

**Why this priority**: This is the entire point of the feature — without it, the Give panel shows nothing useful and the app's core "see what your connections want" value isn't delivered.

**Independent Test**: Can be fully tested by signing in as a user with at least one active connection who has added ideas, opening the Give panel, and confirming those ideas are visible and identifiable as belonging to that connection.

**Acceptance Scenarios**:

1. **Given** the signed-in user has 1 active connection who has added 2 ideas, **When** they open the Give panel, **Then** both ideas are shown, each identifiable as belonging to that connection.
2. **Given** the signed-in user has 2 active connections who have each added ideas, **When** they open the Give panel, **Then** ideas from both connections are shown, each identifiable as belonging to the correct connection.
3. **Given** the signed-in user has 1 active connection with ideas and the user also has their own ideas on their "My Ideas" list, **When** they open the Give panel, **Then** only the connection's ideas are shown — the user's own ideas do not appear on the Give panel.

---

### User Story 2 - See a clear empty state when there's nothing to give ideas for yet (Priority: P2)

A user with no active connections, or whose active connections haven't added any ideas yet, opens the Give panel. Instead of a blank or broken-looking screen, they see a message explaining there's nothing to show yet.

**Why this priority**: Prevents a confusing blank screen from looking like an error; important for a good first-run experience but secondary to the core browsing capability.

**Independent Test**: Can be fully tested by signing in as a user with 0 active connections, opening the Give panel, and confirming an empty-state message appears; and separately as a user with an active connection who has no ideas yet, confirming the same.

**Acceptance Scenarios**:

1. **Given** the signed-in user has 0 active connections, **When** they open the Give panel, **Then** an empty-state message is shown instead of a list.
2. **Given** the signed-in user has 1 or more active connections but none of them have added any ideas, **When** they open the Give panel, **Then** an empty-state message is shown instead of a list.

---

### User Story 3 - Give panel reflects current connections and ideas (Priority: P3)

A user's set of connections or their ideas changes — a new connection is accepted, a connection is removed, or a connection adds or removes an idea. Returning to the Give panel shows the current state rather than what was there the last time it was viewed.

**Why this priority**: Ensures the feature stays correct over time rather than only working on first view; lower priority because it's a consequence of correctly implementing User Story 1 rather than new distinct logic.

**Independent Test**: Can be fully tested by viewing the Give panel with 0 active connections (empty state), accepting a connection request from someone who has an idea, reopening the Give panel, and confirming that idea now appears.

**Acceptance Scenarios**:

1. **Given** the signed-in user just accepted a new connection request from someone with an existing idea, **When** they open (or re-open) the Give panel, **Then** that idea is now shown.
2. **Given** the signed-in user removes an active connection, **When** they open (or re-open) the Give panel, **Then** that former connection's ideas are no longer shown.

### Edge Cases

- A connection the user has an active connection with has since deleted an idea: that idea no longer appears on the Give panel.
- A user has a pending (not yet accepted) outgoing or incoming connection request with someone: that person's ideas do NOT appear on the Give panel, since the connection isn't active yet.
- A user has many active connections, each with several ideas: all of them are shown, grouped or labeled clearly enough that the user can tell which ideas belong to which connection.
- Loading the Give panel's data is not instantaneous: while it's in progress, the panel does not show a false empty-state message (which would look like "no ideas") — it distinguishes "still loading" from "confirmed nothing to show."
- Fetching one active connection's ideas fails (e.g., a transient network or permission error) while other connections' ideas load successfully: the panel shows the ideas that did load, silently omits the failed connection's ideas, and does not show a visible error message or block the rest of the list.
- Fetching every active connection's ideas fails: the panel shows the same empty-state message as having no ideas to show, rather than a distinct error message.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display, on the Give panel, the ideas belonging to each of the signed-in user's active (accepted) connections.
- **FR-002**: System MUST exclude ideas belonging to anyone who is not currently an active connection of the signed-in user, including people with only a pending (sent or received) connection request.
- **FR-003**: System MUST identify which connection each displayed idea belongs to, using that connection's email address — consistent with how connections are already identified elsewhere in the app (e.g., the Connections tab).
- **FR-004**: System MUST exclude the signed-in user's own ideas from the Give panel; those remain accessible via the existing "My Ideas" screen.
- **FR-005**: System MUST show each idea's existing title and description content (the same fields already shown for a user's own ideas).
- **FR-006**: System MUST show a distinct empty-state message when the signed-in user has zero active connections, or when their active connections collectively have zero ideas.
- **FR-007**: System MUST distinguish a "still loading" state from a "confirmed empty" state, so the empty-state message in FR-006 is not shown while data is still being fetched.
- **FR-008**: System MUST reflect the signed-in user's current active connections and their current ideas each time the Give panel is opened or returned to, without requiring an app restart.
- **FR-009**: If fetching one active connection's ideas fails, System MUST still show ideas successfully loaded from other active connections, omitting only the failed connection's ideas, without showing a visible error message. If fetching every active connection's ideas fails, System MUST show the same empty-state message used when there are genuinely no ideas to show (FR-006), not a distinct error message.

### Key Entities

- **Idea** (existing): A gift idea with a title and description, owned by the user who created it. This feature reads ideas owned by the signed-in user's active connections, not their own.
- **Connection** (existing, from `002-hide-invite-prompt`): A mutual link between the signed-in user and another user, granting each view access to the other's ideas. Only active/accepted connections are in scope for this feature; pending connection requests are not.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of ideas belonging to a signed-in user's active connections are visible on the Give panel, and clearly attributable to the correct connection.
- **SC-002**: 0% of ideas belonging to non-connections (strangers, or people with only a pending request) ever appear on a user's Give panel.
- **SC-003**: 100% of the signed-in user's own ideas are absent from their own Give panel.
- **SC-004**: Users with no active connections, or whose active connections have no ideas, see a clear empty-state message instead of a blank or ambiguous screen in 100% of observed cases.
- **SC-005**: After a connection is newly accepted or removed, the Give panel reflects that change the next time it is opened, with no stale data requiring an app restart.
- **SC-006**: A failure loading one active connection's ideas never prevents other active connections' ideas from being shown, and never produces a visible error message.

## Assumptions

- "Accepted connection" refers to an active connection (mutual view access already granted via acceptance), as already defined in `002-hide-invite-prompt` — distinct from a pending, not-yet-accepted connection request.
- Connections are identified on the Give panel by email address, matching the existing convention used for active connections in the Connections tab (which also displays raw email addresses, since no shared/readable display-name field exists for another user in the current data model).
- Ideas are refreshed each time the Give panel is opened or gains focus, rather than continuously live-updating while the screen stays open in the background — this matches the existing "My Ideas" screen's current refresh-on-load behavior, since the feature description does not call for a different pattern.
- Viewing is the entire scope of this feature: there is no requirement here for a user to mark, claim, comment on, or otherwise interact with a connection's idea beyond seeing it. Any such interaction is out of scope and would be a separate feature.
- No limit is placed on how many ideas or connections can be shown; all of the signed-in user's active connections' ideas are shown, consistent with how "My Ideas" shows all of a user's own ideas today without pagination.
