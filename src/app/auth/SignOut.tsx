import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useEffect } from "react";
import { Button, DeviceEventEmitter, View } from "react-native";
import { FirebaseUtils } from "../util/FirebaseUtils";


export enum SignOutEvents {
    SIGN_OUT_COMPLETE = "event.onSignOut"
}

export default function SignOut({ signOutListener }: any) {

    useEffect(() => {
        // return () => {
        //     DeviceEventEmitter.removeAllListeners(SignOutEvents.SIGN_OUT_COMPLETE);
        // };
    }, []);

    function signOut() {
        console.log('signout method');

        if(FirebaseUtils.isLocal()) {
            FirebaseUtils.signOut();
            DeviceEventEmitter.emit(SignOutEvents.SIGN_OUT_COMPLETE, { success: true } );
            console.log('local: sign out complete');
        } else {
            GoogleSignin.signOut()
            .then(() => {
                DeviceEventEmitter.emit(SignOutEvents.SIGN_OUT_COMPLETE, { success: true } );
                // signOutListener(true, null);
            })
            .catch((e) => {
                DeviceEventEmitter.emit(SignOutEvents.SIGN_OUT_COMPLETE, { success: false, error: e } );
                // signOutListener(false, e)
                console.error('Sign out failed.', e);
            });
        }
    }

    return (
        <>
            <View style={{ paddingEnd: 10 }}>
            <Button title="Sign Out" onPress={signOut}></Button>
            </View>
        </>
    )
}