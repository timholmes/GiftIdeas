import { useContext } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppContext } from "./AppContext";
import { Button } from "react-native-paper";
import { homeStyles } from "./shared/ApplicationStyles";
import { useConnections } from "./connections/useConnections";


export default function Home({ route, navigation}: any) {

  const appContext = useContext(AppContext);
  const { activeConnections, isLoading } = useConnections(appContext.userInfo?.email);
  const shouldShowInvitePrompt = isLoading || activeConnections.length <= 1;

  return (
    <SafeAreaView style={homeStyles.container}>
      <View>
        <Text style={homeStyles.welcome}>
          Welcome, {appContext.userInfo?.firstName}.
          {'\n'}
        </Text>
        {shouldShowInvitePrompt && (
          <>
            <Text style={homeStyles.title}>
              To invite someone to your ideas, click below.
            </Text>
            <Button
              onPress={() => navigation.navigate('Connections')}
              mode="contained"
              style={homeStyles.button}
            >Add</Button>
          </>
        )}
      </View>
    </SafeAreaView>
  )
}
