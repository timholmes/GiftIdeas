import { User, Idea } from "./DataStoreTypes";

type ApplicationState = {
    isLoading: boolean;
    isSignedIn: boolean;
    userInfo?: User;
    userMessage?: string;
    ideas: Idea[];
    canView: string[];
};
// set initial values for the context

export const initialContext: ApplicationState = {
    isLoading: true,
    isSignedIn: false,
    ideas: [],
    canView: []
};

export type EventData = {
    success: boolean;
    error?: string | Error;
    userInfo?: User;
};
