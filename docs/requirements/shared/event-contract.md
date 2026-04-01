# Shared Requirement: Event Contract

## Overview
All `DeviceEventEmitter` events in the app must follow this contract. Feature-specific event contracts extend this base contract.

## Base Payload Shape
Defined in `types/SystemTypes.ts` as `EventData`.

| Field | Type | Required | Condition |
|-------|------|----------|-----------|
| `success` | `boolean` | Always | — |
| `error` | `string \| Error-like` | Yes | When `success` is `false` |

## Rules
- Exactly one emit per user interaction or async operation.
- Event names are defined as enums co-located with the component that owns the event.
- Every emitted event must have a corresponding registered listener that is removed on component unmount.
- Do not emit events from multiple locations for the same outcome.
- Do not leave app in a loading or indeterminate state after a failure event.
