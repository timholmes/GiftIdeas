import { RulesTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { beforeAll, beforeEach, describe, test } from '@jest/globals';
import { addDoc, collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { resolve } from 'node:path';
import { expectFirestorePermissionDenied, expectPermissionGetSucceeds, setupFirestore } from './utils';

let testEnv: RulesTestEnvironment;
const PROJECT_ID = 'gift-ideas-b1988';
const FIREBASE_JSON = resolve(__dirname, '../firebase.json');

const MY_EMAIL = 'me';
const USER_SHARING_WITH_ME_EMAIL = 'usershare';
const USER_NOT_SHARING_WITH_ME_EMAIL = 'usernotshare';
const OTHER_REQUESTER_EMAIL = 'requester';

beforeAll(async () => {
    testEnv = await setupFirestore();

    await testEnv.clearFirestore();
    await testEnv.withSecurityRulesDisabled(async (context) => {
        let dbContext = context.firestore()
        await addDoc(collection(dbContext, 'users', MY_EMAIL, 'ideas'), {
            title: 'idea1',
            description: 'desc1'
        });

        await addDoc(collection(dbContext, 'users', USER_NOT_SHARING_WITH_ME_EMAIL, 'ideas'), {
            title: 'notsharetitle',
            description: 'notsharedesc'
        });

        await addDoc(collection(dbContext, 'users', USER_SHARING_WITH_ME_EMAIL, 'ideas'), {
            title: 'idea3',
            description: 'desc3'
        });

        await setDoc(doc(dbContext, "users", USER_SHARING_WITH_ME_EMAIL), { canView: [MY_EMAIL]})

        await setDoc(doc(dbContext, "users", MY_EMAIL, "connectionRequests", OTHER_REQUESTER_EMAIL), {
            otherEmail: OTHER_REQUESTER_EMAIL,
            direction: 'incoming',
        });
    });
});


describe("authenticated user security permissions", () => {

    test("I can read my collection of ideas", async function () {
        const db = testEnv.authenticatedContext(MY_EMAIL, {email: MY_EMAIL}).firestore();

        await assertSucceeds(getDocs(collection(db, "users", MY_EMAIL, "ideas")));
    });

    test("I cannot read others data without them sharing", async function () {
        const db = testEnv.authenticatedContext(MY_EMAIL, {email: MY_EMAIL}).firestore();

        const result = await assertFails(getDocs(collection(db, "users", USER_NOT_SHARING_WITH_ME_EMAIL, "ideas")))
        expect(result.code).toBe('permission-denied' || 'PERMISSION_DENIED');
    });

    test("I can read others data sharing with me", async function () {
        const db = testEnv.authenticatedContext(MY_EMAIL, {email: MY_EMAIL}).firestore();

        await assertSucceeds(getDocs(collection(db, "users", USER_SHARING_WITH_ME_EMAIL, "ideas")));
    });

    test("I can read my own connection requests", async function () {
        const db = testEnv.authenticatedContext(MY_EMAIL, {email: MY_EMAIL}).firestore();

        await assertSucceeds(getDocs(collection(db, "users", MY_EMAIL, "connectionRequests")));
    });

    test("I cannot read another user's connection requests", async function () {
        const db = testEnv.authenticatedContext(MY_EMAIL, {email: MY_EMAIL}).firestore();

        const result = await assertFails(getDocs(collection(db, "users", USER_SHARING_WITH_ME_EMAIL, "connectionRequests")));
        expect(result.code).toBe('permission-denied' || 'PERMISSION_DENIED');
    });

    test("I cannot write directly to my own connection requests (Cloud Functions only)", async function () {
        const db = testEnv.authenticatedContext(MY_EMAIL, {email: MY_EMAIL}).firestore();

        await expectFirestorePermissionDenied(
            setDoc(doc(db, "users", MY_EMAIL, "connectionRequests", "someone-else"), {
                otherEmail: "someone-else",
                direction: 'outgoing',
            })
        );
    });
});
