import { useState } from "react";
import { DeviceEventEmitter, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { Tim, Alex } from "../../../test/auth/StubUsers";
import { User } from "../../../types/DataStoreTypes";
import { siteStyles } from "../shared/ApplicationStyles";
import { FirebaseUtils } from "../util/FirebaseUtils";
import { SignInEvents } from "./SignIn";


export default function SignInStub() {

    const [loading, setLoading] = useState(false);

    async function handleClickUser(user: User) {
        setLoading(true);
        try {
            await FirebaseUtils.stubSignIn(user);
            console.log('SignInStub: Stub signin success');
            DeviceEventEmitter.emit(SignInEvents.SIGN_IN_COMPLETE, { success: true, userInfo: user });
        } catch (error: any) {
            console.error('SignInStub: Firebase login failed.', error);
            DeviceEventEmitter.emit(SignInEvents.SIGN_IN_COMPLETE, { success: false, error });
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={siteStyles.container}>
            <Text style={{ paddingTop: 10, paddingBottom: 20 }}>Select a user below to test with that user.</Text>
            <View style={{ paddingBottom: 10 }}>
                <Button onPress={() => handleClickUser(Tim)} mode="contained" style={siteStyles.primaryButton} disabled={loading}>Tim</Button>
            </View>
            <View style={{ paddingBottom: 10 }}>
                <Button onPress={() => handleClickUser(Alex)} mode="contained" style={siteStyles.primaryButton} disabled={loading}>Alex</Button>
            </View>
        </View>
    )
}