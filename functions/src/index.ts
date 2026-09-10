/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {
  CallableRequest,
  HttpsError,
  onCall,
} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import {FieldValue} from "firebase-admin/firestore";

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
  logger.info("Hello logs!!!4", {structuredData: true});
  logger.info("Request data: ", request.data);

  logger.info("Response: ", {message: "Hello from Firebase!"});
  return {message: "Hello from Firebase!"};
});

interface SendConnectionRequestData {
  targetEmail?: string;
}

interface CancelConnectionRequestData {
  toEmail?: string;
}

interface RespondConnectionRequestData {
  fromEmail?: string;
}

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Shown for any email with no matching account. It must not be more
// specific than this, or it could be used to discover who has an account.
const GENERIC_SEND_FAILURE_MESSAGE = "Unable to send connection request.";

/**
 * Normalizes an email address for storage and lookup.
 * @param {string} email - The raw email address.
 * @return {string} The lowercased, trimmed email address.
 */
function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Confirms the caller is authenticated and returns their normalized email.
 * @param {CallableRequest<unknown>} request - The onCall request.
 * @return {string} The caller's normalized email address.
 */
function requireAuthenticatedCaller(request: CallableRequest<unknown>): string {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "User must be authenticated to manage connections."
    );
  }

  const callerEmail = (request.auth.token?.email as string | undefined)
    ?.toLowerCase().trim();
  if (!callerEmail) {
    throw new HttpsError(
      "unauthenticated",
      "Authenticated user has no email on their token."
    );
  }

  return callerEmail;
}

/**
 * Validates a required email-address argument.
 * @param {unknown} value - The raw argument value.
 * @param {string} fieldName - The argument's name, for error messages.
 * @return {string} The normalized email address.
 */
function validateEmailArg(value: unknown, fieldName: string): string {
  if (!value || typeof value !== "string" || !value.trim()) {
    throw new HttpsError("invalid-argument", `${fieldName} is required.`);
  }

  const normalized = normalizeEmail(value);
  if (!EMAIL_FORMAT.test(normalized)) {
    throw new HttpsError(
      "invalid-argument",
      `${fieldName} is not a valid email address.`
    );
  }

  return normalized;
}

/**
 * Sends a connection request to another user by email. Rejects self-adds,
 * duplicate/pending requests, and emails with no matching account (using a
 * generic, enumeration-safe message for the latter). If the target already
 * has a pending request to the caller, this call accepts it instead of
 * creating a second pending pair.
 * @param {CallableRequest<SendConnectionRequestData>} request - targetEmail.
 * @return {Promise<{status: string}>} "pending" or "connected".
 */
exports.sendConnectionRequest = onCall(async (
  request: CallableRequest<SendConnectionRequestData>
) => {
  logger.info("sendConnectionRequest called", {auth: request.auth});

  const callerEmail = requireAuthenticatedCaller(request);
  const targetEmail = validateEmailArg(
    request.data?.targetEmail,
    "targetEmail"
  );

  if (targetEmail === callerEmail) {
    throw new HttpsError(
      "failed-precondition",
      "You cannot add yourself as a connection."
    );
  }

  const db = admin.firestore();
  const callerDoc = db.collection("users").doc(callerEmail);
  const targetDoc = db.collection("users").doc(targetEmail);
  const callerRequestRef = callerDoc
    .collection("connectionRequests").doc(targetEmail);

  const [callerSnap, targetSnap, existingRequestSnap] = await Promise.all([
    callerDoc.get(),
    targetDoc.get(),
    callerRequestRef.get(),
  ]);

  if (!callerSnap.exists) {
    throw new HttpsError(
      "not-found",
      "Your account could not be found. Please sign out and back in."
    );
  }

  if (!targetSnap.exists) {
    throw new HttpsError("not-found", GENERIC_SEND_FAILURE_MESSAGE);
  }

  const existingCanView =
    (callerSnap.data()?.canView as string[] | undefined) ?? [];
  if (existingCanView.includes(targetEmail)) {
    throw new HttpsError(
      "already-exists",
      "You are already connected with this person."
    );
  }

  const targetRequestRef = targetDoc
    .collection("connectionRequests").doc(callerEmail);

  if (existingRequestSnap.exists) {
    const existingDirection = existingRequestSnap.data()
      ?.direction as string | undefined;

    if (existingDirection === "outgoing") {
      throw new HttpsError(
        "already-exists",
        "A connection request is already pending."
      );
    }

    // existingDirection === "incoming": the target already requested to
    // connect with us — treat this call as acceptance, not a new request.
    const acceptBatch = db.batch();
    acceptBatch.delete(callerRequestRef);
    acceptBatch.delete(targetRequestRef);
    acceptBatch.update(callerDoc, {
      canView: FieldValue.arrayUnion(targetEmail),
    });
    acceptBatch.update(targetDoc, {
      canView: FieldValue.arrayUnion(callerEmail),
    });
    await acceptBatch.commit();
    return {status: "connected"};
  }

  const createdAt = FieldValue.serverTimestamp();
  const sendBatch = db.batch();
  sendBatch.set(callerRequestRef, {
    otherEmail: targetEmail,
    direction: "outgoing",
    createdAt,
  });
  sendBatch.set(targetRequestRef, {
    otherEmail: callerEmail,
    direction: "incoming",
    createdAt,
  });
  await sendBatch.commit();
  return {status: "pending"};
});

/**
 * Cancels a pending connection request the caller previously sent.
 * @param {CallableRequest<CancelConnectionRequestData>} request - toEmail.
 * @return {Promise<{success: boolean}>} Success confirmation.
 */
exports.cancelConnectionRequest = onCall(async (
  request: CallableRequest<CancelConnectionRequestData>
) => {
  const callerEmail = requireAuthenticatedCaller(request);
  const toEmail = validateEmailArg(request.data?.toEmail, "toEmail");

  const db = admin.firestore();
  const callerRequestRef = db.collection("users").doc(callerEmail)
    .collection("connectionRequests").doc(toEmail);

  const callerRequestSnap = await callerRequestRef.get();
  if (
    !callerRequestSnap.exists ||
    callerRequestSnap.data()?.direction !== "outgoing"
  ) {
    throw new HttpsError(
      "not-found",
      "No pending request to that email was found."
    );
  }

  const targetRequestRef = db.collection("users").doc(toEmail)
    .collection("connectionRequests").doc(callerEmail);

  const batch = db.batch();
  batch.delete(callerRequestRef);
  batch.delete(targetRequestRef);
  await batch.commit();

  return {success: true};
});

/**
 * Accepts a pending connection request sent to the caller, establishing
 * mutual view access between both accounts.
 * @param {CallableRequest<RespondConnectionRequestData>} request - fromEmail.
 * @return {Promise<{success: boolean}>} Success confirmation.
 */
exports.acceptConnectionRequest = onCall(async (
  request: CallableRequest<RespondConnectionRequestData>
) => {
  const callerEmail = requireAuthenticatedCaller(request);
  const fromEmail = validateEmailArg(request.data?.fromEmail, "fromEmail");

  const db = admin.firestore();
  const callerDoc = db.collection("users").doc(callerEmail);
  const senderDoc = db.collection("users").doc(fromEmail);
  const callerRequestRef = callerDoc
    .collection("connectionRequests").doc(fromEmail);

  const callerRequestSnap = await callerRequestRef.get();
  if (
    !callerRequestSnap.exists ||
    callerRequestSnap.data()?.direction !== "incoming"
  ) {
    throw new HttpsError(
      "not-found",
      "No pending request from that email was found."
    );
  }

  const senderRequestRef = senderDoc
    .collection("connectionRequests").doc(callerEmail);

  const batch = db.batch();
  batch.delete(callerRequestRef);
  batch.delete(senderRequestRef);
  batch.update(callerDoc, {
    canView: FieldValue.arrayUnion(fromEmail),
  });
  batch.update(senderDoc, {
    canView: FieldValue.arrayUnion(callerEmail),
  });
  await batch.commit();

  return {success: true};
});

/**
 * Declines a pending connection request sent to the caller. No connection
 * is created and the sender is not shown a distinct "declined" signal.
 * @param {CallableRequest<RespondConnectionRequestData>} request - fromEmail.
 * @return {Promise<{success: boolean}>} Success confirmation.
 */
exports.declineConnectionRequest = onCall(async (
  request: CallableRequest<RespondConnectionRequestData>
) => {
  const callerEmail = requireAuthenticatedCaller(request);
  const fromEmail = validateEmailArg(request.data?.fromEmail, "fromEmail");

  const db = admin.firestore();
  const callerRequestRef = db.collection("users").doc(callerEmail)
    .collection("connectionRequests").doc(fromEmail);

  const callerRequestSnap = await callerRequestRef.get();
  if (
    !callerRequestSnap.exists ||
    callerRequestSnap.data()?.direction !== "incoming"
  ) {
    throw new HttpsError(
      "not-found",
      "No pending request from that email was found."
    );
  }

  const senderRequestRef = db.collection("users").doc(fromEmail)
    .collection("connectionRequests").doc(callerEmail);

  const batch = db.batch();
  batch.delete(callerRequestRef);
  batch.delete(senderRequestRef);
  await batch.commit();

  return {success: true};
});
