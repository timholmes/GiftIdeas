
type ApplicationState = {
    isLoading: boolean,
    isSignedIn: boolean,
    userInfo?: User,
    userMessage?: string,
    ideas: Idea[],
    canView: string[]
}

// set initial values for the context
export const initialContext: ApplicationState = {
    isLoading: true,
    isSignedIn: false,
    ideas: [],
    canView: []
}

export declare interface User {
    firstName: string,
    email: string
    sub?: string,
    email_verified?: boolean
}

export declare interface Idea {
    id?: string,
    title: string,
    description: string
}
