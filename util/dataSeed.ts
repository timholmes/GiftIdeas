import type { Idea, User } from "../types/DataStoreTypes";

export const userSeed: User[] = [
  {
    firstName: "Me",
    email: "me@example.com",
    sub: "auth0|me-001",
    email_verified: true,
  },
  {
    firstName: "Friend1",
    email: "friend1@example.com",
    sub: "auth0|friend1-002",
    email_verified: false,
  },
  {
    firstName: "Friend2",
    email: "friend2@example.com",
    sub: "auth0|friend2-003",
    email_verified: false,
  },
];

export const ideaSeed: Idea[] = [
  {
    id: "idea-001",
    title: "Weekend Cabin Gift",
    description: "Book a two-night cabin stay with hiking nearby.",
  },
  {
    id: "idea-002",
    title: "Coffee Subscription",
    description: "Three-month small-batch coffee subscription.",
  },
];

export const dataSeed = {
  users: userSeed,
  ideas: ideaSeed,
};