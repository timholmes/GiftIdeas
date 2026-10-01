import { Firestore, arrayRemove, doc, updateDoc } from "firebase/firestore";
import { FirebaseUtils } from "../util/FirebaseUtils";
import { httpsCallable } from "firebase/functions";

export enum FirestoreErrorCodes {
    PERMISSION_DENIED = 'permission-denied'
}

function getFunctionsErrorCode(error: unknown): string | undefined {
    if (error && typeof error === 'object' && 'code' in error) {
        return (error as { code: unknown }).code as string;
    }
    return undefined;
}

// Maps sendConnectionRequest failures to their required user-facing message.
// The "functions/not-found" message is intentionally generic — it must not
// confirm or deny that an account exists for the entered email (FR-004).
export function getSendConnectionRequestErrorMessage(error: unknown): string {
    switch (getFunctionsErrorCode(error)) {
        case 'functions/failed-precondition':
            return "You can't add yourself as a connection.";
        case 'functions/already-exists':
            return "You're already connected, or a request is already pending, with that email.";
        case 'functions/not-found':
            return "Couldn't send request. Please double-check the email and try again.";
        case 'functions/invalid-argument':
            return "Please enter a valid email address.";
        default:
            return "Something went wrong sending your request. Please try again.";
    }
}

export async function sendConnectionRequest(targetEmail: string): Promise<{ status: 'pending' | 'connected' }> {
    const functions = FirebaseUtils.getFirestoreFunctions();
    const sendConnectionRequestFn = httpsCallable<{ targetEmail: string }, { status: 'pending' | 'connected' }>(functions, 'sendConnectionRequest');

    const result = await sendConnectionRequestFn({ targetEmail });
    return result.data;
}

export async function cancelConnectionRequest(toEmail: string): Promise<void> {
    const functions = FirebaseUtils.getFirestoreFunctions();
    const cancelConnectionRequestFn = httpsCallable<{ toEmail: string }, { success: boolean }>(functions, 'cancelConnectionRequest');

    await cancelConnectionRequestFn({ toEmail });
}

export async function acceptConnectionRequest(fromEmail: string): Promise<void> {
    const functions = FirebaseUtils.getFirestoreFunctions();
    const acceptConnectionRequestFn = httpsCallable<{ fromEmail: string }, { success: boolean }>(functions, 'acceptConnectionRequest');

    await acceptConnectionRequestFn({ fromEmail });
}

export async function declineConnectionRequest(fromEmail: string): Promise<void> {
    const functions = FirebaseUtils.getFirestoreFunctions();
    const declineConnectionRequestFn = httpsCallable<{ fromEmail: string }, { success: boolean }>(functions, 'declineConnectionRequest');

    await declineConnectionRequestFn({ fromEmail });
}

export async function deleteConnectionByEmail(userEmail: string, connectionEmail: string) {
    const db: Firestore = FirebaseUtils.getFirestoreDatabase();
    const docRef = doc(db, "users", userEmail)
    await updateDoc(docRef, {
        canView: arrayRemove(connectionEmail)
    });
}