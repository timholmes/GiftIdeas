import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useContext, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Idea } from "../../../types/DataStoreTypes";
import { AppContext } from "../AppContext";
import { useConnections } from "../connections/useConnections";
import { IconButton } from "../shared/Buttons";
import { IdeaCard } from "../shared/IdeaCard";
import { SwipeToDelete } from "../shared/SwipeableItem";
import { colors, spacing, type } from "../shared/theme";
import { deleteIdea, findAllIdeas } from "./IdeasService";

export default function MyIdeas({ route, navigation }: any) {
    const appContext = useContext(AppContext);
    const email = appContext.userInfo?.email;
    const { activeConnections } = useConnections(email);
    const [ideas, setIdeas] = useState<Idea[]>([]);

    const loadIdeas = useCallback(async () => {
        // TODO: show a a critical error and force login
        if (!email) {
            console.error('User info is missing.')
            return;
        }

        let allIdeas: Idea[] = [];
        try {
            allIdeas = await findAllIdeas(email)
        } catch (error) {
            console.error("Error getting idea list.", error)
        }

        setIdeas(allIdeas);
        appContext.ideas = allIdeas;
    }, [email]);

    // reload whenever the tab regains focus, e.g. after adding an idea
    useFocusEffect(
        useCallback(() => {
            loadIdeas();
        }, [loadIdeas])
    );

    async function handleDelete(idea: Idea) {
        if (!idea.id || !email) {
            console.error("Unable to delete idea. Missing id or email")
            return;
        }

        try {
            await deleteIdea(email, idea.id)
            await loadIdeas()
        } catch (error) {
            console.error(error);
        }
    }

    const openIdea = (idea: Idea) => navigation.navigate('AddIdea', { idea: idea })

    const friendCount = activeConnections.length;
    const visibility = friendCount > 0
        ? `Visible to your ${friendCount} ${friendCount === 1 ? 'friend' : 'friends'}`
        : 'Only you can see these';

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <View style={styles.headerText}>
                        <Text style={type.largeTitle}>My ideas</Text>
                        <View style={styles.visibility}>
                            <MaterialCommunityIcons name="eye-outline" size={16} color={colors.textSecondary} />
                            <Text style={type.subhead}>{visibility}</Text>
                        </View>
                    </View>
                    <IconButton
                        testID="add-idea-button"
                        icon="plus"
                        accessibilityLabel="Add an idea"
                        onPress={() => navigation.navigate('AddIdea')}
                    />
                </View>

                {ideas.length === 0 && (
                    <Text style={type.subhead}>No ideas yet. Tap + to add the first one.</Text>
                )}

                <View style={styles.list}>
                    {ideas.map((idea, index) =>
                        <SwipeToDelete key={idea.id ?? index} onDelete={() => handleDelete(idea)}>
                            <IdeaCard
                                idea={idea}
                                onPress={() => openIdea(idea)}
                                onMorePress={() => openIdea(idea)}
                            />
                        </SwipeToDelete>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.bgBase,
    },
    content: {
        paddingHorizontal: spacing.screen,
        paddingTop: 20,
        paddingBottom: 32,
        gap: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 12,
    },
    headerText: {
        flex: 1,
        gap: 4,
    },
    visibility: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    list: {
        gap: 12,
    },
});
