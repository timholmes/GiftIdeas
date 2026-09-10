# Feature Specification: Add Connection by Email

**Feature Branch**: `001-add-connection-email`

**Created**: 2026-09-09

**Status**: Draft

**Input**: User description: "add a new connection via their email address"

## Clarifications

### Session 2026-09-09

- Q: Should the sender be able to cancel or withdraw a connection request while it's still pending? → A: Yes — sender can cancel a pending request they sent, removing it immediately.
- Q: Should recipients get a push notification when a new connection request arrives, or is it enough that they see it the next time they open the app? → A: No push notification — recipient sees pending requests only when they open the app and view their connections list.
- Q: When someone enters an email that has no matching account, should the error explicitly say no account was found, or should it use a generic message that doesn't confirm whether that email is registered? → A: Generic — show a message like "couldn't send request" without confirming the account doesn't exist.
- Q: When a recipient declines a request, should the sender be told it was declined, or should the request just quietly disappear from the sender's pending list? → A: Quietly disappears — no distinct "declined" notice to the sender.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Send a connection request by email (Priority: P1)

As a user, I want to add a new connection by typing the other person's email
address, so that we can become connected once they confirm.

**Why this priority**: This is the core capability requested — without it,
users have no way to initiate a connection at all. It is the minimum viable
slice of this feature.

**Independent Test**: Can be fully tested by entering a valid, registered
email address into the "add connection" form and submitting it; delivers
value by producing a visible, persisted pending request with no other
feature required.

**Acceptance Scenarios**:

1. **Given** I am on the "Add Connection" screen, **When** I enter the email
   address of an existing registered user and submit, **Then** a pending
   connection request is created and appears in my list marked as pending
   (not yet an active connection).
2. **Given** I am on the "Add Connection" screen, **When** I enter text that
   is not a properly formatted email address and submit, **Then** I see a
   validation message and no request is created.
3. **Given** I have successfully sent a connection request, **When** I
   return to my connections list, **Then** the pending request is visible
   without needing to manually refresh.
4. **Given** I have sent a pending connection request, **When** I cancel it
   before the recipient responds, **Then** the request is removed and no
   connection is created.

---

### User Story 2 - Accept or decline a connection request (Priority: P2)

As a user, I want to accept or decline connection requests sent to me, so
that I control who gains the ability to view my ideas.

**Why this priority**: The connection is not actually established until the
recipient responds, so this is essential to complete the core loop. It is
still independently testable and deliverable as its own slice.

**Independent Test**: Can be fully tested by placing the system in a state
where a pending request already exists (e.g., via test setup or a prior
request) and verifying that accepting grants mutual access while declining
does not.

**Acceptance Scenarios**:

1. **Given** I have a pending connection request from another user, **When**
   I accept it, **Then** both of us gain the ability to view each other's
   ideas and the request no longer shows as pending.
2. **Given** I have a pending connection request from another user, **When**
   I decline it, **Then** no connection is created, the request is removed
   from both my list and the sender's list, and neither user gains the
   ability to view the other's ideas. The sender is not shown a distinct
   "declined" notice — the request simply no longer appears as pending.
3. **Given** I have a pending connection request, **When** I take no action,
   **Then** neither party gains the ability to view the other's ideas until
   I respond.

---

### User Story 3 - Clear feedback on failed or blocked attempts (Priority: P3)

As a user, I want clear feedback when my attempt to add a connection fails
or is blocked, so that I understand why and can correct the problem.

**Why this priority**: Without clear error feedback, failed or blocked
attempts look like silent no-ops or crashes, eroding trust in the feature
even when the core request/accept flow works.

**Independent Test**: Can be fully tested by attempting to send requests
with invalid, duplicate, self-referencing, or unregistered email addresses
and confirming a specific, actionable message is shown for each case.

**Acceptance Scenarios**:

1. **Given** I am on the "Add Connection" screen, **When** I enter my own
   email address and submit, **Then** I see a message explaining I cannot
   add myself and no request is created.
2. **Given** I already have an active connection or a pending request
   (sent or received) involving a given email address, **When** I try to
   send a request to that same email address again, **Then** I see a
   message indicating a connection or request already exists and no
   duplicate is created.
3. **Given** I enter an email address that does not match any registered
   user account, **When** I submit, **Then** I see a generic message that
   the request could not be sent — without the message confirming whether
   an account exists for that email — and no request is created.
4. **Given** I submit a valid, eligible email address but the request fails
   due to a system or network error, **When** the failure occurs, **Then**
   I see a message telling me the attempt failed and inviting me to retry.

---

### User Story 4 - View connections and pending requests (Priority: P4)

As a user, I want to see my active connections and any pending requests
(sent and received), so that I can track the status of each relationship
and know when a response is needed from me.

**Why this priority**: This supports and verifies User Stories 1-2 but is a
read-only convenience — the send and accept/decline flows already confirm
outcomes on their own, so this is valuable but not blocking for the MVP.

**Independent Test**: Can be fully tested by viewing the connections list
screen with a mix of zero, active, and pending (sent/received) entries and
confirming the displayed list matches actual status.

**Acceptance Scenarios**:

1. **Given** I have active connections, **When** I open my connections
   list, **Then** each active connection is displayed distinctly from any
   pending requests.
2. **Given** I have a pending request I sent, **When** I open my list,
   **Then** it is shown as pending and awaiting the recipient's response.
3. **Given** I have a pending request someone sent me, **When** I open my
   list, **Then** it is shown with the option to accept or decline.
4. **Given** I have no connections or requests, **When** I open my list,
   **Then** I see an empty state rather than an error or blank screen.

---

### Edge Cases

- What happens when the entered email is missing, malformed, or contains
  extra whitespace/mixed case?
- What happens when the entered email belongs to the current user?
- What happens when the entered email already matches an active connection
  or an existing pending request (sent or received)?
- What happens when the entered email does not belong to any registered
  user? The request MUST be rejected with a generic "couldn't send
  request" style message that does not confirm whether an account exists
  for that email; no invitation is sent.
- What happens if two users each send a connection request to one another
  before either responds? Per the Assumptions below, the second request is
  treated as acceptance of the first, establishing the connection
  immediately.
- What happens if the recipient declines a request — can the sender try
  again later? Per the Assumptions below, yes.
- What happens if the user double-submits the form (e.g., taps "add" twice
  quickly)?
- What happens if a send, accept, or decline action fails due to a network
  or server error after the user has already left the screen?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to send a new connection request by
  entering another registered user's email address.
- **FR-002**: System MUST validate that the entered value is a properly
  formatted email address before attempting to send the request, and MUST
  show an inline validation message when it is not.
- **FR-003**: System MUST prevent a user from sending a connection request
  to their own email address and MUST show a clear message explaining why.
- **FR-004**: System MUST reject the request — and MUST NOT create any
  connection or pending request — when the entered email address does not
  match an existing registered user account. The rejection message MUST be
  generic (e.g., "couldn't send request") and MUST NOT confirm or deny
  whether an account exists for that email, to prevent using this feature
  to discover who has an account.
- **FR-005**: System MUST prevent creating a duplicate connection request
  when the entered email address already matches an active connection or an
  existing pending request (sent or received) involving that email address,
  and MUST inform the user accordingly rather than creating a second entry.
- **FR-006**: System MUST create a pending connection request — rather than
  an immediately active connection — when a user submits a valid request to
  an eligible recipient (an existing, distinct, not-already-connected user).
- **FR-007**: Recipients MUST be able to view connection requests that have
  been sent to them.
- **FR-008**: Recipients MUST be able to accept a pending connection
  request; accepting MUST establish an active connection that grants both
  users the ability to view each other's ideas.
- **FR-009**: Recipients MUST be able to decline a pending connection
  request; declining MUST remove the request (from both the sender's and
  recipient's views) without creating a connection, and without surfacing a
  distinct "declined" notice to the sender.
- **FR-010**: System MUST NOT grant either user the ability to view the
  other's ideas while a connection request remains pending (i.e., before
  the recipient accepts it).
- **FR-011**: System MUST display active connections and pending requests
  (both sent and received) in the user's connections list without requiring
  a manual app restart.
- **FR-012**: System MUST show a distinct, user-facing error message when a
  send, accept, or decline action fails due to a system or network error,
  and MUST leave the user able to retry.
- **FR-013**: Users MUST be able to view the full list of their active
  connections and pending requests.
- **FR-014**: Senders MUST be able to cancel a pending connection request
  they sent, before it has been accepted or declined; canceling MUST remove
  the request without creating a connection.

### Key Entities

- **Connection**: An active, mutual link between two user accounts,
  established only after a connection request has been accepted. Once
  active, both users can view each other's ideas.
- **Connection Request**: A pending, one-directional record created when
  one user asks to connect with another by email. It exists in a pending
  state until the recipient accepts (converting it into an active
  Connection), the recipient declines (removing it), or the sender cancels
  it (removing it).
- **User Account**: A registered person in the system, uniquely identified
  by their email address. An email address entered while sending a
  connection request may or may not correspond to an existing User Account;
  requests to non-existent accounts are rejected (see FR-004).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can send a connection request, from entering an email
  address to seeing it appear as pending in their list, in under 30
  seconds.
- **SC-002**: 100% of invalid or blocked attempts (malformed email,
  self-add, unregistered email, duplicate/pending request) produce a
  clear, actionable message rather than a silent failure — specific where
  it is safe to be (e.g., malformed email, self-add, duplicate/pending),
  and deliberately generic only where specificity would reveal whether an
  email is registered (unregistered email, per FR-004).
- **SC-003**: 95% of users who send a request to a valid, registered
  recipient succeed in creating a pending request on their first attempt
  without needing to retry or seek help.
- **SC-004**: Newly created pending requests and newly accepted connections
  are visible in the relevant list within 2 seconds of the action, with no
  manual refresh required.
- **SC-005**: Recipients can respond to a pending connection request
  (accept or decline) in a single, clear action, with no reported confusion
  about what each choice means.

## Assumptions

- Email address is the only identifier used to add a connection; no
  username, phone number, QR code, or shareable-link mechanism is in scope
  for this feature.
- Email matching is case-insensitive and ignores leading/trailing
  whitespace, consistent with standard email-handling practice.
- Declining a request does not permanently block future requests between
  the same two accounts — the original sender may send a new request later.
- If two users each send a connection request to one another before either
  responds, the second request is treated as acceptance of the first,
  establishing an active connection immediately rather than creating two
  independent pending requests.
- Removing an already-active connection is out of scope for this feature
  (assumed to already be handled by an existing capability) — this spec
  covers only sending, accepting, and declining connection requests.
- The user must be signed in to send, accept, or decline a connection
  request; unauthenticated access is out of scope.
- Push or other proactive notifications when a request arrives are out of
  scope for this feature; recipients discover pending requests by opening
  the app and viewing their connections list (see FR-013).
