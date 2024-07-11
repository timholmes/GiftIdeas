import { StyleSheet } from "react-native";

export const siteStyles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 10
    },
    titleText: {
        marginVertical: 20
    },
    primaryButton: {
        width: 100,
        alignContent: 'center'
    }
})

export const crudListStyles = StyleSheet.create({
    ...siteStyles,
    list: {
        flexGrow: 1,
    },
    fabStyle: {
        bottom: 0,
        right: 16,
        position: 'absolute',
    },
});

export const crudAddStyles = StyleSheet.create({
    container: {
        margin: 10
    },
    input: {
        margin: 5
    }
});

export const homeStyles = StyleSheet.create({
    container: {
        flex: 1
    },
    welcome: {
        fontSize: 18
    },
    title: {
        marginVertical: 8,
        fontSize: 16
    },
    button: {
        width: 100,
        margin: 10,
        alignContent: 'center'
    }
});