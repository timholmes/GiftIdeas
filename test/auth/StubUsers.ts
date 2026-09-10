import { dataSeed } from "../../util/dataSeed";
import { User } from "../../types/DataStoreTypes";

// Use users from dataSeed for consistency
export const Me: User = dataSeed.users[0]; // me@example.com
export const Friend1: User = dataSeed.users[1]; // friend1@example.com
export const Friend2: User = dataSeed.users[2]; // friend2@example.com

// Legacy names for backwards compatibility
// export const Me = Me;
// export const Sharing = Tim;
// export const NotSharing = Alex;