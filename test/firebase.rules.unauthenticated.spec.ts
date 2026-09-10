import { RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { beforeAll, beforeEach, describe, test } from '@jest/globals';
import { addDoc, collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { resolve } from 'node:path';
import { expectFirestorePermissionDenied, setupFirestore } from './utils';

let testEnv: RulesTestEnvironment;
const PROJECT_ID = 'gift-ideas-b1988';
const FIREBASE_JSON = resolve(__dirname, '../firebase.json');


beforeAll(async () => {
    testEnv = await setupFirestore();
    await testEnv.clearFirestore();
});

describe("unauthenticated user", () => {
    test('should not be able to read anything without logging in', async function () {

        // Setup: Create documents in DB for testing (bypassing Security Rules).
        await testEnv.withSecurityRulesDisabled(async (context) => {
            await addDoc(collection(context.firestore(), 'users', 'test1@email.com', 'ideas'), {
                title: 'idea1',
                description: 'desc1'
            });
        });

        await testEnv.withSecurityRulesDisabled(async (context) => {
            await addDoc(collection(context.firestore(), "users", "test1@email.com", "sharing"), {
                view: ['test2@email.com']
            });
        });

        await testEnv.withSecurityRulesDisabled(async (context) => {
            await addDoc(collection(context.firestore(), "users", "test1@email.com", "connectionRequests"), {
                otherEmail: 'test2@email.com',
                direction: 'outgoing',
            });
        });

        const unauthedDb = testEnv.unauthenticatedContext().firestore();

        // try to access
        await expectFirestorePermissionDenied(getDoc(doc(unauthedDb, 'users/test1@email.com')));
        await expectFirestorePermissionDenied(getDoc(doc(unauthedDb, 'users/test1@email.com/ideas/title')));
        await expectFirestorePermissionDenied(getDoc(doc(unauthedDb, 'users/test1@email.com/sharing/view')));
        await expectFirestorePermissionDenied(getDocs(collection(unauthedDb, 'users/test1@email.com/connectionRequests')));

    });

});