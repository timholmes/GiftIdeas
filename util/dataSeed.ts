import type { Idea, User } from "../types/DataStoreTypes";

export const userSeed: User[] = [
  {
    firstName: "Tim",
    email: "tim@example.com",
    sub: "auth0|tim-001",
    email_verified: true,
  },
  {
    firstName: "Alex",
    email: "alex@example.com",
    sub: "auth0|alex-002",
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