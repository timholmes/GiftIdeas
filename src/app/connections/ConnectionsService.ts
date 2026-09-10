import { Firestore, arrayRemove, doc, updateDoc } from "firebase/firestore";
import { FirebaseUtils } from "../util/FirebaseUtils";
import { httpsCallable } from "firebase/functions";

export enum FirestoreErrorCodes {
    PERMISSION_DENIED = 'permission-denied'
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