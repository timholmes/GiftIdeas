# Stub Sign-In Requirements (Draft)

## Purpose
Enable reliable local feature testing without real Google sign-in by selecting predefined test users.

## In Scope
- Stub user selection and sign-in success/failure behavior.
- Logging and error behavior for local debugging.

## Out of Scope
- Production Google sign-in flow.
- Real user onboarding or profile enrichment.
- Permission model redesign.

## Entry Conditions
- App is running in local mode.
- Sign-in screen routes to the stub page.
- Stub user fixtures are available.

## Features
- As a developer, I want to see a list of test users on the sign-in screen so that I can sign in quickly without a real Google account.
- As a developer, I want selecting a test user to sign me into the app so that I can test features as that user.
- As a developer, I want sign-in failures to emit a clear error event so that the app does not get stuck in a loading state.
- As a developer, I want buttons disabled while sign-in is in progress so that I cannot accidentally trigger duplicate sign-in attempts.
- As a developer, I do not want any cloud utility test functions on this page.

## Error Handling Requirements
- Surface failures with structured logs and event payload details.
- Handle auth emulator unavailable, invalid credential, and network failure.
- Never leave app in loading state after failure.

## Non-Functional Requirements
- Local environment behavior only.
- Sign-in action should complete quickly under normal emulator conditions.
- Deterministic behavior across repeated runs.

## Acceptance Criteria
- [ ] Clicking each stub user signs into the app and routes to main tabs.
- [ ] Failed sign-in keeps user on sign-in stack and does not partially populate app state.
- [ ] No duplicate `SIGN_IN_COMPLETE` events are observed per click.
- [ ] App state transitions are correct for success and failure outcomes.
- [ ] Stub behavior remains reliable after hot reload.

## Test Scenarios
- Success path for each fixture user.
- Auth emulator unavailable path.
- Network failure path.
- Double-click on the same user.
- Rapid clicking across different users.

