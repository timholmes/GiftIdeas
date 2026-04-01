# Shared Requirement: Sign-In Event Contract

Extends: [event-contract.md](event-contract.md)

## Event Name
`SignInEvents.SIGN_IN_COMPLETE` (`event.onSignIn`)

Defined in `src/app/auth/SignIn.tsx`.

## Additional Payload Fields

| Field | Type | Required | Condition |
|-------|------|----------|-----------|
| `userInfo` | `User` | Yes | When `success` is `true` |

## Rules
- Consumer is `handleSignIn` in `App.tsx`.
- Any feature that triggers sign-in must conform to both the base event contract and this payload shape.
