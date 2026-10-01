import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ReactNode, useRef } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { colors, radius } from "./theme";

type Props = {
    children: ReactNode,
    onDelete: () => void,
    deleteLabel?: string,
    testID?: string,
}

// Swipe left to reveal a destructive (Rose) action.
export function SwipeToDelete({ children, onDelete, deleteLabel = 'Delete', testID }: Props) {
    const swipeableRef = useRef<Swipeable>(null);

    const renderRightActions = () => (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={deleteLabel}
            onPress={() => {
                swipeableRef.current?.close();
                onDelete();
            }}
            style={({ pressed }) => [styles.action, pressed ? styles.actionPressed : null]}
        >
            <MaterialCommunityIcons name="trash-can-outline" size={22} color={colors.danger} />
            <Text style={styles.actionText}>{deleteLabel}</Text>
        </Pressable>
    );

    return (
        <Swipeable
            ref={swipeableRef}
            testID={testID}
            renderRightActions={renderRightActions}
            overshootRight={false}
            containerStyle={styles.container}
        >
            {children}
        </Swipeable>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: radius.card,
    },
    action: {
        width: 96,
        marginLeft: 8,
        borderRadius: radius.card,
        backgroundColor: colors.dangerMuted,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    actionPressed: {
        opacity: 0.8,
    },
    actionText: {
        color: colors.danger,
        fontSize: 13,
        fontWeight: '600',
    },
});
