import { User } from "../../src/app/Types";

export const Me: User = {
    firstName: 'Me',
    email: 'me@me.com',
    sub: 'me',
    email_verified: true
}

export const NotSharing: User = {
    firstName: 'NotSharing',
    email: 'not_sharing@test.com',
    sub: 'notsharing',
    email_verified: true
}

export const Sharing: User = {
    firstName: 'Sharing',
    email: 'sharing@test.com',
    sub: 'sharing',
    email_verified: true
}