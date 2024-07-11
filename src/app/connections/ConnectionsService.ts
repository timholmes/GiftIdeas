import { DocumentData, DocumentReference, Firestore, arrayRemove, arrayUnion, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { FirebaseUtils } from "../util/FirebaseUtils";

export enum FirestoreErrorCodes {
    PERMISSION_DENIED = 'permission-denied'
}

export async function findAllConnections(email: string): Promise<string[]> {
        const db: Firestore = FirebaseUtils.getFirestoreDatabase();
console.log(email);
        // TODO: simplify firestore query to path based
        let docRef = undefined;
        try {
            docRef = doc(db, "users", email, "sharing", "view")
        } catch (error) {
            console.log('Unable to get users document reference.', error);
        }

        let userDocument: any;
        if (docRef == undefined) {
            throw new Error(`Cannot get firestore document for email ${email}`)
        }

        userDocument = await getDoc(docRef) // do this to determine permission?
        return userDocument.data()?.users
}

export async function addConnectionEmail(email: string, connectionEmail: string): Promise<DocumentReference<DocumentData, DocumentData>> {
    const db: Firestore = FirebaseUtils.getFirestoreDatabase();

    const docRef = doc(db, "users", email, "sharing", "view");
    await updateDoc(docRef, {
        users: arrayUnion(connectionEmail)
    });

    return docRef;
}

export async function deleteConnectionByEmail(userEmail: string, connectionEmail: string) {
    const db: Firestore = FirebaseUtils.getFirestoreDatabase();
    const docRef = doc(db, "users", userEmail, "sharing", "view")
    await updateDoc(docRef, {
        users: arrayRemove(connectionEmail)
    });
}