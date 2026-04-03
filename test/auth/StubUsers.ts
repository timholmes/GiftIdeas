import { dataSeed } from "../../util/dataSeed";
import { User } from "../../types/DataStoreTypes";

// Use users from dataSeed for consistency
export const Tim: User = dataSeed.users[0]; // tim@example.com
export const Alex: User = dataSeed.users[1]; // alex@example.com

// Legacy names for backwards compatibility
export const Me = Tim;
export const Sharing = Tim;
export const NotSharing = Alex;