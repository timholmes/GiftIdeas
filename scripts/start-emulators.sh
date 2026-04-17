#!/bin/bash

# Kill any existing Firebase emulators
echo "Killing any existing Firebase emulators..."
pkill -f "firebase emulators" || true
sleep 2

# Start Firebase emulators in the background
firebase emulators:start &

# Wait for Firestore emulator to be ready (check if port 8085 is responding)
echo "Waiting for Firebase emulator to start..."
while ! nc -z localhost 8085; do
  sleep 1
done

echo "Emulator is ready. Running seed script..."

# Run the seeding script
npm run backend:reset

echo "Seeding complete. Emulator is running with seeded data."