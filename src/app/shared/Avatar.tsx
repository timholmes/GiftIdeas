import { StyleSheet, Text, View } from "react-native";
import { avatarPalette, colors } from "./theme";

type Props = {
    email: string,
    size?: 24 | 32 | 40 | 44 | 64,
    ringColor?: string   // border used when avatars overlap in a stack
}

// Friend's display name until profiles carry one: the part of the email before the @.
export function nameFromEmail(email: string): string {
    return email.split('@')[0];
}

export function initialsFromEmail(email: string): string {
    const letters = nameFromEmail(email).replace(/[^a-zA-Z0-9]/g, '');
    return (letters.slice(0, 2) || '?').toUpperCase();
}

// Same email always gets the same tint.
export function avatarColorsFor(email: string) {
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
        hash = (hash * 31 + email.charCodeAt(i)) | 0;
    }
    return avatarPalette[Math.abs(hash) % avatarPalette.length];
}

export function Avatar({ email, size = 44, ringColor }: Props) {
    const palette = avatarColorsFor(email);
    const fontSize = size <= 24 ? 10 : size <= 32 ? 12 : size <= 44 ? 15 : 22;

    return (
        <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[
                styles.avatar,
                { width: size, height: size, backgroundColor: palette.background },
                ringColor ? { borderWidth: 2, borderColor: ringColor } : null,
            ]}
        >
            <Text style={{ color: palette.foreground, fontSize, fontWeight: '700' }}>{initialsFromEmail(email)}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    avatar: {
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bgOverlay,
    },
});
