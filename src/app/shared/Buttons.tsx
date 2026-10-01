import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ComponentProps, ReactNode } from "react";
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from "react-native";
import { colors, radius } from "./theme";

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

type Variant = 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'accept' | 'outline';

type ButtonProps = {
    label: string,
    onPress: () => void,
    variant?: Variant,
    icon?: IconName,
    size?: 'large' | 'medium' | 'small',
    disabled?: boolean,
    testID?: string,
    accessibilityLabel?: string,
    style?: StyleProp<ViewStyle>,
}

const variantColors: Record<Variant, { background: string, pressed: string, text: string, border?: string }> = {
    primary: { background: colors.primary, pressed: colors.primaryPressed, text: colors.textOnAccent },
    secondary: { background: colors.bgOverlay, pressed: colors.border, text: colors.textPrimary },
    tertiary: { background: 'transparent', pressed: colors.bgOverlay, text: colors.secondary },
    destructive: { background: colors.dangerMuted, pressed: colors.primaryMuted, text: colors.danger },
    accept: { background: colors.presenceMuted, pressed: colors.bgOverlay, text: colors.presence },
    outline: { background: 'transparent', pressed: colors.bgOverlay, text: colors.textPrimary, border: colors.border },
};

const heights = { large: 52, medium: 48, small: 40 };

// Pill button. One primary (Apricot) action per screen; everything else stays quiet.
export function Button({ label, onPress, variant = 'primary', icon, size = 'large', disabled, testID, accessibilityLabel, style }: ButtonProps) {
    const palette = variantColors[variant];
    const textColor = disabled ? colors.textTertiary : palette.text;
    const fontSize = size === 'small' ? 15 : 17;

    return (
        <Pressable
            testID={testID}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            accessibilityState={{ disabled }}
            disabled={disabled}
            onPress={onPress}
            style={({ pressed }) => [
                styles.button,
                {
                    height: heights[size],
                    paddingHorizontal: size === 'small' ? 14 : 22,
                    backgroundColor: disabled ? colors.bgOverlay : pressed ? palette.pressed : palette.background,
                    borderWidth: palette.border ? 1 : 0,
                    borderColor: palette.border,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                },
                style,
            ]}
        >
            {icon && <MaterialCommunityIcons name={icon} size={fontSize + 3} color={textColor} />}
            <Text style={{ color: textColor, fontSize, fontWeight: '600' }}>{label}</Text>
        </Pressable>
    );
}

type IconButtonProps = {
    icon: IconName,
    accessibilityLabel: string,
    onPress: () => void,
    variant?: Variant,
    size?: number,
    testID?: string,
    children?: ReactNode,
}

// Round, icon-only button. Always carries an accessibility label.
export function IconButton({ icon, accessibilityLabel, onPress, variant = 'primary', size = 48, testID }: IconButtonProps) {
    const palette = variantColors[variant];

    return (
        <Pressable
            testID={testID}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            onPress={onPress}
            hitSlop={size < 44 ? (44 - size) / 2 : 0}
            style={({ pressed }) => [
                styles.iconButton,
                {
                    width: size,
                    height: size,
                    backgroundColor: pressed ? palette.pressed : palette.background,
                    borderWidth: palette.border ? 1 : 0,
                    borderColor: palette.border,
                },
            ]}
        >
            <MaterialCommunityIcons name={icon} size={Math.round(size / 2)} color={palette.text} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: radius.pill,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    iconButton: {
        borderRadius: radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
