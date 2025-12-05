/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

exports.helloWorld = onCall((request, response) => {
  logger.info("Hello logs!!!4", { structuredData: true });
  logger.info("Request data: ", request.data);

  logger.info("Response: ", { message: "Hello from Firebase!" });
  // response.send({
  //   "status": 200,
  //   "data": "some... data3"
  // });
  return { message: "Hello from Firebase!" };
});

exports.addConnection = onCall((request) => {
    // const email = request.data.email;
    // logger.info("isSignedUpUser called for email: ", email);

    // const db = FirebaseUtils.getFirestoreDatabase();
    // const userDocRef = doc(db, "users", email);
    // const userDocSnap = await getDoc(userDocRef);

    return { message: "addConnection called" };

});
