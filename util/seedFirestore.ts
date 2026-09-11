import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import firebaseConfig from "../firebase-config.json";
import { ideaSeedByEmail, userSeed } from "./dataSeed";
import type { Idea, User } from "../types/DataStoreTypes";

const FIRESTORE_EMULATOR_HOST = "127.0.0.1:8085";

function initializeAdmin(): void {
  // Force Admin SDK to target local Firestore emulator.
  process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST ?? FIRESTORE_EMULATOR_HOST;

  if (getApps().length === 0) {
    initializeApp({
      projectId: firebaseConfig.result.sdkConfig.projectId,
    });
  }
}

function getIdeaDocId(idea: Idea, index: number): string {
  return idea.id ?? "seed-idea-" + String(index + 1);
}

export async function seedFirestoreEmulator(
  users: User[] = userSeed,
  ideasByEmail: Record<string, Idea[]> = ideaSeedByEmail
): Promise<void> {
  initializeAdmin();
  const db = getFirestore();
  const batch = db.batch();
  let totalIdeas = 0;

  users.forEach((user) => {
    const userRef = db.collection("users").doc(user.email);
    batch.set(userRef, user);

    const ideas = ideasByEmail[user.email] ?? [];
    ideas.forEach((idea, index) => {
      const ideaRef = userRef.collection("ideas").doc(getIdeaDocId(idea, index));
      batch.set(ideaRef, {
        title: idea.title,
        description: idea.description,
      });
      totalIdeas++;
    });
  });

  await batch.commit();
  console.log(
    "Seeded " +
      String(users.length) +
      " users and " +
      String(totalIdeas) +
      " ideas (unique per user) into Firestore emulator at " +
      FIRESTORE_EMULATOR_HOST +
      "."
  );
}

seedFirestoreEmulator().catch((error) => {
  console.error("Failed to seed Firestore emulator", error);
  process.exitCode = 1;
});