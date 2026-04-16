# Firestore Database Schema Documentation

## Overview
This document outlines the structure of the Firestore database for the Gift Ideas app. The database is organized around user-centric data, with all collections nested under a top-level `users` collection. Data is schemaless but enforced via TypeScript types, Firestore Security Rules, and application logic.

- **Top-Level Collection**: `users`
- **Authentication**: All operations require authentication (`request.auth != null`).
- **Access Control**: Users can read/write their own data and read data shared with them via the `canView` field.
- **No Custom Indexes**: Relies on Firestore's automatic single-field indexes. Add custom indexes to `firestore.indexes.json` if needed for complex queries.
- **Data Types**: Defined in `types/DataStoreTypes.ts` and `SystemTypes.ts`.

## Collections and Documents

### 1. `users` Collection
**Path**: `/users/{userEmail}`  
**Purpose**: Stores user profiles and permissions. Each document represents a user identified by their email.  
**Access Rules**:
- Read/Write: Only the authenticated user whose email matches the document ID.
- Subcollections inherit these rules.

**Document Structure** (TypeScript: `User` interface):
```typescript
interface User {
  firstName: string;      // User's first name
  email: string;          // User's email (matches document ID)
  sub?: string;           // Optional: Auth provider sub (e.g., from Google)
  email_verified?: boolean; // Optional: Email verification status
  canView: string[];      // Array of emails allowed to view this user's ideas
}
```
- **Fields**:
  - `firstName` (string, required): Display name.
  - `email` (string, required): Must match the document ID and auth token.
  - `sub` (string, optional): Used for OAuth integration.
  - `email_verified` (boolean, optional): From auth provider.
  - `canView` (array of strings, implied required for sharing): Emails of users who can view this user's ideas. Managed via `ConnectionsService.ts` and Cloud Functions.
- **Validation**: Enforced in Security Rules (e.g., email must match auth token). No explicit schema validation beyond rules.
- **Usage**: Created/updated via auth flows. `canView` is modified by `addConnection` and `deleteConnectionByEmail` functions.

### 2. `users/{userEmail}/ideas` Subcollection
**Path**: `/users/{userEmail}/ideas/{ideaId}`  
**Purpose**: Stores individual gift ideas for each user.  
**Access Rules**:
- Read/Write: Owner (userEmail matches auth email).
- Read: Users listed in the owner's `canView` array.

**Document Structure** (TypeScript: `Idea` interface):
```typescript
interface Idea {
  id?: string;          // Auto-generated document ID (not stored in Firestore)
  title: string;        // Idea title
  description: string;  // Idea description
}
```
- **Fields**:
  - `title` (string, required): Short title of the idea.
  - `description` (string, required): Detailed description.
- **Validation**: No explicit Firestore validation; relies on TypeScript and client-side checks.
- **Usage**:
  - Created via `createIdea()` in `IdeasService.ts`.
  - Read via `findAllIdeas()` (returns array of `Idea` objects).
  - Deleted via `deleteIdea()`.
  - Shared: Other users can read if their email is in the owner's `canView`.

## Relationships and Permissions
- **Sharing Model**: Implemented via the `canView` array in user documents. No separate "connections" collection—permissions are denormalized.
- **No Direct Connections Collection**: Sharing is managed through user documents and Cloud Functions (`addConnection` in `functions/src/index.ts`, though currently stubbed).
- **Subcollections**: Only `ideas` is implemented. Other features (e.g., `give`, `permissions`) appear incomplete in code (e.g., `GiveList.tsx` is mostly commented out).
- **Potential Future Collections**: Based on app folders (`connections`, `give`, `permissions`), you may add:
  - `users/{userEmail}/connections`: For explicit connection requests.
  - `users/{userEmail}/sharing`: For granular permissions (mentioned in commented code in `Sharing.tsx`).

## Security Rules Summary
- **File**: `firestore.rules`
- **Key Functions**:
  - `loggedInAndMine(email)`: Checks auth and email match.
  - `canViewIdeasGranted(email)`: Checks if current user is in the target user's `canView`.
- **Rules**:
  - `/users/{email}/ideas/{document=**}`: Owner read/write; shared read.
  - `/users/{email}/{document=**}`: Owner read/write (covers user docs and other subcollections).
- **Testing**: Covered in `test/firebase.rules.authenticated.self.spec.ts` and `test/firebase.rules.unauthenticated.spec.ts`.

## Indexes
- **File**: `firestore.indexes.json`
- **Current State**: Empty (no custom indexes defined).
- **Automatic Indexes**: Firestore creates single-field indexes automatically.
- **Recommendations**: If you add queries (e.g., filtering ideas by title), define composite indexes here.

## Data Flow and Application Integration
- **Client Code**: Uses Firebase SDK v10 (modular API: `doc`, `collection`, `getDoc`, etc.).
- **Real-Time**: Not currently used (no `onSnapshot` in visible code).
- **Cloud Functions**: Minimal; `addConnection` is a stub for managing `canView`.
- **Emulator**: Tested via `backend:start` script; data seeded in `util/emulator-data/`.
- **Type Safety**: Enforced via TypeScript; cast Firestore data to interfaces (e.g., in `IdeasService.ts`).

## Recommendations for Expansion
- **Add Schema Validation**: Extend `firestore.rules` with field/type checks (e.g., ensure `title` is a string).
- **Indexes**: Add if queries grow (e.g., for searching ideas).
- **Migrations**: Use Cloud Functions for schema changes on existing data.
- **Documentation**: Update this doc as you add features (e.g., via the `update-docs-on-code-change` instruction).
- **Testing**: Expand rule tests for new collections.

This structure supports user isolation and sharing. If you add new collections or fields, update the types and rules accordingly!