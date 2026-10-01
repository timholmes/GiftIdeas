import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { DeviceEventEmitter, Pressable, Text } from "react-native";
import { FirebaseUtils } from "../util/FirebaseUtils";
import { colors } from "../shared/theme";


export enum SignOutEvents {
    SIGN_OUT_COMPLETE = "event.onSignOut"
}

export default function SignOut() {

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
            })
            .catch((e) => {
                DeviceEventEmitter.emit(SignOutEvents.SIGN_OUT_COMPLETE, { success: false, error: e } );
                console.error('Sign out failed.', e);
            });
        }
    }

    return (
        <Pressable
            testID="sign-out-button"
            accessibilityRole="button"
            onPress={signOut}
            hitSlop={8}
            style={({ pressed }) => ({
                height: 36,
                paddingHorizontal: 14,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: colors.border,
                justifyContent: 'center',
                backgroundColor: pressed ? colors.bgOverlay : 'transparent',
            })}
        >
            <Text style={{ color: colors.textSecondary, fontSize: 15, fontWeight: '600' }}>Sign Out</Text>
        </Pressable>
    )
}
