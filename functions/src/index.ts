/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { HttpsError, onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

admin.initializeApp();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

/**
 * A simple hello world function for testing Firebase Functions.
 * Returns a greeting message to verify function deployment.
 * @param request - The HTTPS request object containing data and authentication.
 * @param response - The response object (not used in this function).
 * @returns An object with a greeting message.
 */
exports.helloWorld = onCall((request, response) => {
  logger.info("Hello logs!!!4", { structuredData: true });
  logger.info("Request data: ", request.data);

  logger.info("Response: ", { message: "Hello from Firebase!" });
  return { message: "Hello from Firebase!" };
});

/**
 * Allows an authenticated user to add another user as a connection.
 * This grants the current user view permissions to the target user's data.
 * Validates authentication, email formats, and prevents self-connections.
 * @param request - The HTTPS request object containing currentUserEmail and targetUserEmail.
 * @returns An object with success status.
 * @throws HttpsError for unauthenticated, invalid arguments, or permission issues.
 */
exports.addConnection = onCall(async (request) => {
    logger.info("addConnection called", { auth: request.auth, data: request.data });

    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be authenticated to add a connection.');
    }

    const currentUserEmail = request.data?.currentUserEmail;
    const targetUserEmail = request.data?.targetUserEmail;

    if (!currentUserEmail || typeof currentUserEmail !== 'string' || !currentUserEmail.trim()) {
        throw new HttpsError('invalid-argument', 'currentUserEmail is required.');
    }

    if (!targetUserEmail || typeof targetUserEmail !== 'string' || !targetUserEmail.trim()) {
        throw new HttpsError('invalid-argument', 'targetUserEmail is required.');
    }

    const normalizedCurrentEmail = currentUserEmail.toLowerCase().trim();
    const normalizedTargetEmail = targetUserEmail.toLowerCase().trim();

    if (normalizedCurrentEmail === normalizedTargetEmail) {
        throw new HttpsError('failed-precondition', 'You cannot add yourself as a connection.');
    }

    const authEmail = (request.auth.token?.email as string | undefined)?.toLowerCase().trim();
    if (!authEmail || authEmail !== normalizedCurrentEmail) {
        throw new HttpsError('permission-denied', 'Authenticated user email does not match the provided currentUserEmail.');
    }

    const db = admin.firestore();
    const currentUserDoc = db.collection('users').doc(normalizedCurrentEmail);
    const targetUserDoc = db.collection('users').doc(normalizedTargetEmail);

    const [currentUserSnap, targetUserSnap] = await Promise.all([
        currentUserDoc.get(),
        targetUserDoc.get(),
    ]);

    if (!currentUserSnap.exists) {
        throw new HttpsError('not-found', `Current user ${normalizedCurrentEmail} does not exist.`);
    }

    if (!targetUserSnap.exists) {
        throw new HttpsError('not-found', `No user found with email ${normalizedTargetEmail}.`);
    }

    await currentUserDoc.update({
        canView: admin.firestore.FieldValue.arrayUnion(normalizedTargetEmail),
    });

    return { success: true };
});
