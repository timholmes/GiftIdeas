import { DarkTheme, Theme } from "@react-navigation/native";
import { MD3DarkTheme, MD3Theme } from "react-native-paper";
import { colors } from "./theme";

// Dusk colors mapped onto the navigation and react-native-paper themes (used by App.tsx).
export const navigationTheme: Theme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        primary: colors.primary,
        background: colors.bgBase,
        card: colors.bgBase,
        text: colors.textPrimary,
        border: colors.divider,
        notification: colors.primary,
    },
};

export const paperTheme: MD3Theme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        primary: colors.primary,
        onPrimary: colors.textOnAccent,
        secondary: colors.secondary,
        background: colors.bgBase,
        surface: colors.bgSurface,
        surfaceVariant: colors.bgRaised,
        onSurface: colors.textPrimary,
        onSurfaceVariant: colors.textSecondary,
        outline: colors.border,
        error: colors.danger,
        inverseSurface: colors.bgOverlay,
        inverseOnSurface: colors.textPrimary,
        inversePrimary: colors.primary,
    },
};
