
// import { expect } from '@jest/globals';
var assert = require('assert')

// At the top of test/index.test.js
const test = require('firebase-functions-test')({
    databaseURL: 'https://gift-ideas-b1988-default-rtdb.firebaseio.com',
    storageBucket: 'gift-ideas-b1988.appspot.com',
    projectId: 'gift-ideas-b1988',
  }, '../../gift-ideas-b1988-51ddb3e64ac5-app-engine-default-svc-acct.json');

  describe('Cloud Functions', () => {
    let myFunctions;
  
    before(() => {
      // Require index.js and save the exports inside a namespace called myFunctions.
      // This includes our cloud functions, which can now be accessed at myFunctions.makeUppercase
      // and myFunctions.addMessage
      myFunctions = require('../lib/index');
    });
  
    after(() => {
      // Do cleanup tasks.
      test.cleanup();
      // Reset the database.
    //   admin.database().ref('messages').remove();
    });
  
    describe('makeUpperCase', () => {
      // Test Case: setting messages/11111/original to 'input' should cause 'INPUT' to be written to
      // messages/11111/uppercase
      it('should upper case input and write it to /uppercase', () => {
        // [START assertOnline]
        // Create a DataSnapshot with the value 'input' and the reference path 'messages/11111/original'.
        // const snap = test.database.makeDataSnapshot('input', 'messages/11111/original');
  
        // Wrap the makeUppercase function
        // const wrapped = test.wrap(myFunctions.makeUppercase);
        // Call the wrapped function with the snapshot you constructed.
        // return wrapped(snap).then(() => {
        //   // Read the value of the data at messages/11111/uppercase. Because `admin.initializeApp()` is
        //   // called in functions/index.js, there's already a Firebase app initialized. Otherwise, add
        //   // `admin.initializeApp()` before this line.
        //   return admin.database().ref('messages/11111/uppercase').once('value').then((createdSnap) => {
        //     // Assert that the value is the uppercased version of our input.
        //     assert.equal(createdSnap.val(), 'INPUT');
        //   });
        // });
        // [END assertOnline]
          const res = {
              send: (sentReply) => {
                  // expect(sentReply.status).toBe(200);
                  assert.equal(sentReply.status, 200);
                  // done();
              }
          }
        myFunctions.helloWorld({}, res);
        // assert.equal(true, true);
      })
    //   assert(true).equals(true);
    });
  
  })