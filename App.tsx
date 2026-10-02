import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useContext, useEffect, useState } from 'react';
import { DeviceEventEmitter, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';
import { AppContext } from './src/app/AppContext';
import Home from './src/app/Home';
import SignIn, { SignInEvents } from './src/app/auth/SignIn';
import { SignOutEvents } from './src/app/auth/SignOut';
import ListConnections from './src/app/connections/ListConnections';
import { useConnections } from './src/app/connections/useConnections';
import GiveList from './src/app/give/GiveList';
import { AddIdea } from './src/app/ideas/AddIdea';
import MyIdeas from './src/app/ideas/MyIdeas';
import { navigationTheme, paperTheme } from './src/app/shared/appThemes';
import { colors, stackScreenOptions } from './src/app/shared/theme';
import { FirebaseUtils } from './src/app/util/FirebaseUtils';
import { initialContext } from './types/SystemTypes';

GoogleSignin.configure();  // required - initializes the native config

// Navigators live at module scope so App re-renders don't remount the navigation tree.
const HomeStack = createNativeStackNavigator();
const IdeasStack = createNativeStackNavigator();
const GiveStack = createNativeStackNavigator();
const ConnectionsStack = createNativeStackNavigator();
const SignInStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function SignInStackScreen() {
  return (
    <SignInStack.Navigator>
      <SignInStack.Screen name="SignIn" component={SignIn} />
    </SignInStack.Navigator>
  )
}

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={stackScreenOptions}>
      <HomeStack.Screen name="Home" component={Home} options={{ headerShown: false, headerTitle: "" }} />
    </HomeStack.Navigator>
  )
}

function IdeasStackScreen() {
  return (
    <IdeasStack.Navigator screenOptions={stackScreenOptions}>
      <IdeasStack.Screen name="MyIdeas" component={MyIdeas} options={{ headerShown: false }} />
      <IdeasStack.Screen name="AddIdea" component={AddIdea} options={{ title: "Idea", headerBackTitle: "My ideas" }} />
    </IdeasStack.Navigator>
  )
}

function GiveStackScreen() {
  return (
    <GiveStack.Navigator screenOptions={stackScreenOptions}>
      <GiveStack.Screen name="GiveScreen" component={GiveList} options={{ headerShown: false }} />
    </GiveStack.Navigator>
  )
}

function ConnectionsStackScreens() {
  return (
    <ConnectionsStack.Navigator screenOptions={stackScreenOptions}>
      <ConnectionsStack.Screen name="Connect" component={ListConnections} options={{ headerShown: false }} />
    </ConnectionsStack.Navigator>
  )
}

function MainTabs() {
  const appContext = useContext(AppContext);
  const { incomingRequests } = useConnections(appContext.userInfo?.email);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.bgBase,
          borderTopColor: colors.divider,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarBadgeStyle: {
          backgroundColor: colors.primary,
          color: colors.textOnAccent,
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackScreen}
        initialParams={appContext.userInfo}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-outline" color={color} size={size} />
          )
        }} />
      <Tab.Screen
        name="My Ideas"
        initialParams={appContext.userInfo}
        component={IdeasStackScreen}
        options={{
          tabBarLabel: 'My ideas',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="gift-outline" color={color} size={size} />
          )
        }} />
      <Tab.Screen
        name="GiveTab"
        initialParams={appContext.userInfo}
        component={GiveStackScreen}
        options={{
          tabBarLabel: "Friends' ideas",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-multiple-outline" color={color} size={size} />
          )
        }} />
      <Tab.Screen
        name="Connections"
        initialParams={appContext.userInfo}
        component={ConnectionsStackScreens}
        options={{
          tabBarLabel: 'Connections',
          tabBarBadge: incomingRequests.length > 0 ? incomingRequests.length : undefined,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-plus-outline" color={color} size={size} />
          )
        }} />
    </Tab.Navigator>
  )
}

/*
  Main application entry point

  Handles the following tasks:
    - initializes firebase environment
    - listens for sign-in and sign-out events
    - manages global application state via AppContext
    - sets up navigation structure

*/
export default function App() {
  const [state, setState] = useState(initialContext)

  LogBox.ignoreAllLogs();

  // re-initialize firebase auth state
  useEffect(() => {
    setupEnvironment();
    DeviceEventEmitter.addListener(SignInEvents.SIGN_IN_COMPLETE, (eventData) => { handleSignIn(eventData) })
    DeviceEventEmitter.addListener(SignOutEvents.SIGN_OUT_COMPLETE, (eventData) => { handleSignOut(eventData) })  // not getting called in some stub scenarios

    return () => {
      DeviceEventEmitter.removeAllListeners();
    };
  }, []);

  async function setupEnvironment() {
    if (FirebaseUtils.isLocal()) {
      console.log("App: Environment is 'local'.");
    }
  }

  async function handleSignIn(eventData: any) {
    console.log(`App: Signin is complete.  Success? ${eventData.success}`);

    if (eventData.success == false) {
      setState({ ...initialContext, isLoading: false, isSignedIn: false })
    } else {
      setState({ ...initialContext, isLoading: false, userInfo: eventData.userInfo, isSignedIn: true })
    }
  }

  function handleSignOut(eventData: any) {
    if (eventData.success && !eventData.error) {
      setState({ ...initialContext, isSignedIn: false, isLoading: false });
    } else {
      setState({ ...initialContext, isSignedIn: false, isLoading: false, userMessage: 'Sign-out failed.' });
    }
    return;
  }

  // The Dusk theme covers the signed-in app; sign-in screens keep the default light look.
  return (
    <PaperProvider theme={state.isSignedIn ? paperTheme : MD3LightTheme}>
      <AppContext.Provider value={state}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style={state.isSignedIn ? 'light' : 'auto'} />
          <NavigationContainer theme={state.isSignedIn ? navigationTheme : DefaultTheme}>
            {!state.isSignedIn && <SignInStackScreen />}
            {state.isSignedIn && <MainTabs />}
          </NavigationContainer>
        </GestureHandlerRootView>
      </AppContext.Provider>
    </PaperProvider>
  );
}
