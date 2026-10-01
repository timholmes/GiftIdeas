import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Idea } from "../../../types/DataStoreTypes";
import { colors, radius, type } from "./theme";

type Props = {
    idea: Idea,
    onPress?: () => void,        // mine: opens the editor
    onMorePress?: () => void,    // mine: overflow menu
    raised?: boolean,            // use the Haze surface when the card sits on a Dusk section
    testID?: string,
}

// Gift idea card. Mine are editable with an overflow button; a friend's are read-only.
export function IdeaCard({ idea, onPress, onMorePress, raised, testID }: Props) {
    return (
        <Pressable
            testID={testID}
            disabled={!onPress}
            onPress={onPress}
            accessibilityRole={onPress ? 'button' : undefined}
            style={({ pressed }) => [
                styles.card,
                { backgroundColor: pressed ? colors.bgOverlay : raised ? colors.bgRaised : colors.bgSurface },
            ]}
        >
            <View style={styles.thumb}>
                <MaterialCommunityIcons name="gift-outline" size={26} color={colors.textTertiary} />
            </View>
            <View style={styles.body}>
                <View style={styles.titleRow}>
                    <Text style={[type.headline, styles.title]}>{idea.title}</Text>
                    {onMorePress && (
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`More options for ${idea.title}`}
                            onPress={onMorePress}
                            hitSlop={6}
                            style={styles.more}
                        >
                            <MaterialCommunityIcons name="dots-horizontal" size={20} color={colors.textSecondary} />
                        </Pressable>
                    )}
                </View>
                {!!idea.description && <Text style={type.subhead}>{idea.description}</Text>}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: radius.card,
        padding: 14,
        flexDirection: 'row',
        gap: 14,
    },
    thumb: {
        width: 64,
        height: 64,
        borderRadius: radius.thumb,
        backgroundColor: colors.bgOverlay,
        alignItems: 'center',
        justifyContent: 'center',
    },
    body: {
        flex: 1,
        minWidth: 0,
        gap: 4,
        justifyContent: 'center',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    title: {
        flex: 1,
    },
    more: {
        width: 32,
        height: 32,
        marginTop: -6,
        marginRight: -6,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
