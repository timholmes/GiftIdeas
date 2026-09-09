---
name: run-maestro-tests
description: Executes standard end-to-end integration workflows inside the iOS simulator.
---

# Instructions
1. Verify that the iOS simulator is running and if it isn't use existing npm scripts to start it.
2. Run all tests on the claude desktop simulator.
3. Build and run the app on that simulator: `npm run ios:start` (pinned to `--device "iPhone 17"`).