# Project Guidelines for AI Coding Agents

## Technical Stack
- Framework: Expo (managed workflow) with React Native.
- Language: TypeScript (strict mode). Existing code uses TS in root and `functions/src`.
- Backend: Firebase (Firestore, Auth, Functions). Firestore rules in `firestore.rules`, indexes in `firestore.indexes.json`.
- Navigation: Project structure is file-based under `src/app` (not full Expo Router now; base structure in `src/app` features).
- State management: local React Context + hooks, no global state library in repo currently.

## Code Style
- Functional components with hooks in `App.tsx` and `src/app/**`.
- Type safety: avoid `any`; use explicit `interface` / `type` for props and Firestore documents.
- Path aliases: follow route imports from `src/app/*` (no custom `@/` alias in root tsconfig currently; use relative imports where standard in project).
- Styling: use `StyleSheet.create` and React Native components (per existing app style).
- Cloud Functions: TypeScript source in `functions/src/index.ts`, compiled to `functions/lib/index.js`.
- Lint: `functions` uses `eslint --ext .js,.ts .` and `eslint-config-google`.

## Firebase & Firestore Patterns
- Data models: define TS types for Firestore collections, e.g., `User`, `Idea`, `Connection` in `src/app/...`.
- Use modular Firebase SDK (`doc`, `getDoc`, `setDoc` etc.) matching `firebase@10.x`.
- Prefers custom hooks (`useAuth`, `useFirestore...`) where present.
- Real-time: use `onSnapshot` with cleanup in `useEffect` return.
- Trust Firestore security rules for validation; UI should do minimal validation.

## Building and Running
- Root app:
  - `npm install`
  - `npm run start`
  - `npm run ios:dev`, `npm run android:dev`, `npm run web:dev`
  - `npm run test`
- Functions package:
  - `cd functions && npm install`
  - `cd functions && npm run build`
  - `cd functions && npm run serve` (build + `firebase emulators:start --only functions`)
  - `cd functions && npm run shell`
  - `cd functions && npm run deploy`
- Root shortcuts:
  - `npm run functions:start` -> `cd functions && npm run serve`

## Project Conventions
- Presentation code for the mobile device is in `src/app/**`

## Integration Points
- Client uses `firebase-config.json` + platform config files (`google-services.json`, `GoogleService-Info.plist`).
- Cloud Functions depend on `firebase-admin` and `firebase-functions`.

## Security
- Enforce `auth != null` in Firestore rules; check tests in `test/**`.
- No hardcoded credentials; use environment and Firebase standard config.

## End-to-end tests
- only test on the default simulator which is iPhone 17 (iOS 26.5)
- For end-to-end iOS testing, use the `run-maestro-tests` skill.
