import { DocumentData, DocumentReference, Firestore, arrayRemove, arrayUnion, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { FirebaseUtils } from "../util/FirebaseUtils";
import { httpsCallable } from "firebase/functions";

export enum FirestoreErrorCodes {
    PERMISSION_DENIED = 'permission-denied'
}

export async function findAllConnections(email: string): Promise<string[]> {
    console.log("ConnectionsService: findAllConnections for ", email);

    const db: Firestore = FirebaseUtils.getFirestoreDatabase();

    // // TODO: simplify firestore query to path based
    // let docRef = undefined;
    // try {
    //     docRef = doc(db, "users", email)
    // } catch (error) {
    //     console.error('Unable to get users document reference.', error);
    // }

    // let userDocument: any;
    // if (docRef == undefined) {
    //     throw new Error(`Cannot get firestore document for email ${email}`)
    // }

    // userDocument = await getDoc(docRef) // do this to determine permission?
    // return userDocument.data().canView
    return [];
}

export async function addConnection(currentUserEmail: string, targetUserEmail: string): Promise<void> {
    try {
        const functions = FirebaseUtils.getFirestoreFunctions();
        const addConnectionFn = httpsCallable(functions, 'addConnection');

        const result = await addConnectionFn({
            currentUserEmail,
            targetUserEmail,
        });

        console.log('addConnection result:', result.data);
    } catch (error) {
        console.error('Error calling addConnection function:', error);
        throw error;
    }
}

export async function deleteConnectionByEmail(userEmail: string, connectionEmail: string) {
    const db: Firestore = FirebaseUtils.getFirestoreDatabase();
    const docRef = doc(db, "users", userEmail)
    await updateDoc(docRef, {
        canView: arrayRemove(connectionEmail)
    });
}