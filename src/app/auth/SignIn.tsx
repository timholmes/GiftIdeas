import { GoogleSignin, statusCodes, User as GoogleUser } from "@react-native-google-signin/google-signin";
import { Button, DeviceEventEmitter } from "react-native";
import { FirebaseUtils } from "../util/FirebaseUtils";
import LoadingOverlay from "../util/LoadingOverlay";
import { useEffect, useState } from "react";
import { User } from "../types/Types";
import SignInStub from "./SignInStub";

export enum SignInEvents {
  SIGN_IN_COMPLETE = "event.onSignIn"
}

const initialState = {
  attemptingReSignin: false,
  reSignInSuccess: false
}

export default function SignIn({ route, navigation}: any) {
  const [state, setState] = useState(initialState)

  useEffect(() => {
    attemptReSignIn();
    console.log('SignIn: setup');
  }, [])

  async function attemptReSignIn() {
    setState({ ...initialState, attemptingReSignin: true });

    if (await GoogleSignin.isSignedIn()) {
      console.log('SignIn: Google - attempting re-signin.');

      let googleUser: GoogleUser | null;
      try {
        googleUser = await GoogleSignin.getCurrentUser();
      } catch (e) {
        console.error(`SignIn: Error getting current user.`)
        setState({ ...initialState, attemptingReSignin: false, reSignInSuccess: false });
        return;
      }

      if (googleUser == null || !googleUser.idToken) {  // id token expired
        setState({ ...initialState, attemptingReSignin: false, reSignInSuccess: false });
        return;
      }

      setState({ ...initialState, attemptingReSignin: true, reSignInSuccess: true });

      const user: User = buildUserFromGoogleUser(googleUser);
      
      console.log('SignIn: Google - re-signin success.');
      DeviceEventEmitter.emit(SignInEvents.SIGN_IN_COMPLETE, { success: true, error: null, userInfo: user });
    }

    setState({ ...initialState, attemptingReSignin: false });
  }

  async function signIn() {
    let googleUser: GoogleUser | null = null;
    try {
      googleUser = await GoogleSignin.signIn();
    } catch (error: any) {  // code doesn't exist on 
      if (error?.code == statusCodes.SIGN_IN_CANCELLED) {
        console.log(error.message);

        DeviceEventEmitter.emit(SignInEvents.SIGN_IN_COMPLETE, { success: false, error: error });
        return;
      }
      
      console.log('SignIn: There was an error signing in.', error.message);
      DeviceEventEmitter.emit(SignInEvents.SIGN_IN_COMPLETE, { success: false, error: error});
    }

    if(googleUser == null || !googleUser.idToken) {
      DeviceEventEmitter.emit(SignInEvents.SIGN_IN_COMPLETE, { success: false, error: new Error("Google returned an invalid response during sign in.") });
    } else {
      await FirebaseUtils.setupUser(googleUser.idToken);
      const user: User = buildUserFromGoogleUser(googleUser);
      DeviceEventEmitter.emit(SignInEvents.SIGN_IN_COMPLETE, { success: true, userInfo: user});
    }
  }

  function buildUserFromGoogleUser(googleUser: GoogleUser) {
    let appUser: User = {
      firstName: (googleUser.user && googleUser.user.givenName) ? googleUser.user.givenName : '',
      email: googleUser.user.email
    }

    return appUser;
  }

  let landingPage = null;
  if(FirebaseUtils.isLocal()) {
    landingPage = <SignInStub></SignInStub>
  } else {
    if(state.attemptingReSignin) {
      landingPage = <LoadingOverlay></LoadingOverlay>
    } else {
      landingPage = <Button title="Sign In" onPress={signIn}></Button>
    }
  }

  return (
    <>
      { landingPage }
    </>
  )
}