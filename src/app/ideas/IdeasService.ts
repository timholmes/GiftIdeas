import { DocumentData, DocumentReference, Firestore, QuerySnapshot, addDoc, collection, deleteDoc, doc, getDoc, getDocs } from "firebase/firestore";
import { Idea } from "../types/DataStoreTypes";
import { FirebaseUtils } from "../util/FirebaseUtils";


export async function findAllIdeas(email: string): Promise<Idea[]> {
    console.log('getting ideas from firebase');

    const db: Firestore = FirebaseUtils.getFirestoreDatabase();
    
    // TODO: simplify firestore query to path based
    let docRef = undefined;
    docRef = doc(db, "users", email)

    if (docRef == undefined) {
        throw new Error("Cannot find user document.")
    }

    // let userDocument = null;
    // userDocument = await getDoc(docRef) // do this to determine permission?

    let querySnapshot: QuerySnapshot = await getDocs(collection(docRef, "ideas"));

    let newIdeas: Idea[] = [];
    querySnapshot.forEach((doc) => {

        let idea: Idea = {
            id: doc.id,
            title: doc.data().title,
            description: doc.data().description
        }
        newIdeas.push(idea)
    });

    return newIdeas;
}

export async function createIdea(email: string, newIdea: Idea): Promise<DocumentReference<DocumentData, DocumentData>> {

    const db: Firestore = FirebaseUtils.getFirestoreDatabase();
    const docRef = await addDoc(collection(db, "users", email, "ideas"), newIdea);

    return docRef;
}

export async function deleteIdea(userEmail: string, id: string) {
    const db: Firestore = FirebaseUtils.getFirestoreDatabase();
    const ideaDocRef = doc(db, "users", userEmail, "ideas", id)
    return deleteDoc(ideaDocRef);
}