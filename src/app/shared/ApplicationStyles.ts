import { StyleSheet } from "react-native";

// Used by the sign-in screens, which sit outside the Dusk theme (see theme.ts).
export const siteStyles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 10
    },
    titleText: {
        marginVertical: 40
    },
    primaryButton: {
        width: 100,
        alignContent: 'center'
    }
})
