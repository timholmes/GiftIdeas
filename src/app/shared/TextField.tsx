import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ComponentProps, useState } from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { colors, radius } from "./theme";

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

type Props = TextInputProps & {
    label?: string,
    hint?: string,
    error?: string,
    icon?: IconName,
    variant?: 'field' | 'search',
}

// Labelled text field. Focus draws a Lilac ring; search fields are pill shaped.
export function TextField({ label, hint, error, icon, variant = 'field', multiline, style, onFocus, onBlur, ...inputProps }: Props) {
    const [isFocused, setIsFocused] = useState(false);
    const isSearch = variant === 'search';

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View
                style={[
                    styles.box,
                    isSearch ? styles.searchBox : null,
                    multiline ? styles.multilineBox : null,
                    isFocused && !isSearch ? styles.focused : null,
                    error ? styles.errored : null,
                ]}
            >
                {icon && <MaterialCommunityIcons name={icon} size={20} color={colors.textTertiary} />}
                <TextInput
                    accessibilityLabel={label ?? inputProps.placeholder}
                    placeholderTextColor={colors.textTertiary}
                    selectionColor={colors.secondary}
                    keyboardAppearance="dark"
                    multiline={multiline}
                    onFocus={(e) => { setIsFocused(true); onFocus?.(e); }}
                    onBlur={(e) => { setIsFocused(false); onBlur?.(e); }}
                    style={[styles.input, multiline ? styles.multilineInput : null, style]}
                    {...inputProps}
                />
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 8,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    box: {
        minHeight: 52,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 14,
        borderRadius: radius.field,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.bgRaised,
    },
    searchBox: {
        minHeight: 44,
        borderRadius: radius.pill,
        borderWidth: 0,
    },
    multilineBox: {
        alignItems: 'flex-start',
        paddingVertical: 12,
    },
    focused: {
        borderColor: colors.secondary,
        borderWidth: 1.5,
    },
    errored: {
        borderColor: colors.danger,
    },
    input: {
        flex: 1,
        minWidth: 0,
        minHeight: 44,
        fontSize: 17,
        color: colors.textPrimary,
    },
    multilineInput: {
        minHeight: 88,
        textAlignVertical: 'top',
    },
    hint: {
        fontSize: 13,
        color: colors.textTertiary,
    },
    error: {
        fontSize: 13,
        color: colors.danger,
    },
});
