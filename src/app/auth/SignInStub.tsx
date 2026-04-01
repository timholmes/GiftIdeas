import { DeviceEventEmitter, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { Me, NotSharing, Sharing } from "../../../test/auth/StubUsers";
import { User } from "../../../types/DataStoreTypes";
import { EventData } from "../../../types/SystemTypes";
import { siteStyles } from "../shared/ApplicationStyles";
import { FirebaseUtils } from "../util/FirebaseUtils";
import { SignInEvents } from "./SignIn";
import { httpsCallable } from "firebase/functions";
import { addConnection } from "../connections/ConnectionsService";


export default function SignInStub() {

    function handleClickUser(user: User) {

        const eventData: EventData = { success: false };
        try {
            FirebaseUtils.stubSignIn(user);
        } catch (error: any) {
            if (error.code == 'auth/invalid-credential') {
                // setState({ ...initialState, userMessage: 'Session expired, you will need to login again.' });
                console.log('SignInStub: ID token is expired.  Sending to sign in page.');

                eventData.success = true;
                DeviceEventEmitter.emit(SignInEvents.SIGN_IN_COMPLETE, eventData);
            } else if (error.code == 'auth/network-request-failed') {
                eventData.success = false;
                DeviceEventEmitter.emit(SignInEvents.SIGN_IN_COMPLETE, eventData);
            }
            console.error('SignInStub: Firebase login failed..', error);
            return;
        }

        console.log("SignInStub: Stub signin success");
        DeviceEventEmitter.emit(SignInEvents.SIGN_IN_COMPLETE, { success: true, userInfo: user });
    }

    async function handleClickFunction() {

        try {

            await addConnection("email1", "email2");

            console.log("done adding ");

            //   const functions = FirebaseUtils.getFirestoreFunctions();
            //   const helloWorld = httpsCallable(functions, 'helloWorld');
        
            //   helloWorld({})
            //     .then((result) => {
            //       console.log('function callback');
            //       console.log(result);
            //     })
            //     .catch((r) => {
            //       console.log('here');
            //       console.error('Error calling helloWorld function:', r);
            //     })
        
            } catch (e) {
              console.log('not here');
              console.error(e);
            }
    }

    return (
        <View style={siteStyles.container}>
            <Text style={{ paddingTop: 10, paddingBottom: 20 }}>Select a user below to test with that user.</Text>
            <View style={{ paddingBottom: 10 }}>
                <Button onPress={() => handleClickFunction()} mode="contained" style={{ width: 200 }}>Cloud Function Test</Button>
            </View>
            <View style={{ paddingBottom: 10 }}>
                <Button onPress={() => handleClickUser(Me)} mode="contained" style={siteStyles.primaryButton}>Me</Button>
            </View>
            <View style={{ paddingBottom: 10 }}>
                <Button onPress={() => handleClickUser(Sharing)} mode="contained" style={siteStyles.primaryButton}>Sharing</Button>
            </View>
            <View style={{ paddingBottom: 10 }}>
                <Button onPress={() => handleClickUser(NotSharing)} mode="contained" style={{ width: 150 }}>Not Sharing</Button>
            </View>
        </View>
    )
}