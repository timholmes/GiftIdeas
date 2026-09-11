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

// Each user's own set of ideas, keyed by email — distinct per user rather
// than shared, so connections' Give panels show genuinely different content.
export const ideaSeedByEmail: Record<string, Idea[]> = {
  "me@example.com": [
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
  ],
  "friend1@example.com": [
    {
      id: "idea-001",
      title: "Board Game Night Set",
      description: "A couple of new board games for game night with friends.",
    },
    {
      id: "idea-002",
      title: "Hiking Boots",
      description: "A sturdy pair of waterproof hiking boots, size 10.",
    },
  ],
  "friend2@example.com": [
    {
      id: "idea-001",
      title: "Pottery Class",
      description: "A beginner pottery class at the local studio.",
    },
    {
      id: "idea-002",
      title: "Succulent Plant Set",
      description: "A small set of easy-care succulents for the windowsill.",
    },
  ],
};

export const dataSeed = {
  users: userSeed,
  ideasByEmail: ideaSeedByEmail,
};
