import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useContext, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppContext } from "../AppContext";
import { useConnections } from "../connections/useConnections";
import { ConnectionIdeas, findIdeasForConnections } from "../ideas/IdeasService";
import { Avatar, nameFromEmail } from "../shared/Avatar";
import { IdeaCard } from "../shared/IdeaCard";
import { TextField } from "../shared/TextField";
import { colors, radius, spacing, type } from "../shared/theme";

const ALL_FRIENDS = 'all';

export default function GiveList({ route, navigation }: any) {
    const appContext = useContext(AppContext);
    const { activeConnections } = useConnections(appContext.userInfo?.email);
    const [connectionIdeas, setConnectionIdeas] = useState<ConnectionIdeas[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedFriend, setSelectedFriend] = useState<string>(ALL_FRIENDS);

    useFocusEffect(
        useCallback(() => {
            let isCurrent = true;
            setIsLoading(true);

            findIdeasForConnections(activeConnections).then((result) => {
                if (isCurrent) {
                    setConnectionIdeas(result);
                    setIsLoading(false);
                }
            });

            return () => {
                isCurrent = false;
            };
        }, [activeConnections])
    );

    const friendsWithIdeas = connectionIdeas.filter((connection) => connection.ideas.length > 0);
    const hasAnyIdeas = friendsWithIdeas.length > 0;

    const query = search.trim().toLowerCase();
    const visibleSections = friendsWithIdeas
        .filter((connection) => selectedFriend === ALL_FRIENDS || connection.email === selectedFriend)
        .map((connection) => {
            if (!query || connection.email.toLowerCase().includes(query)) {
                return connection;
            }
            const ideas = connection.ideas.filter((idea) =>
                idea.title.toLowerCase().includes(query) || idea.description.toLowerCase().includes(query));
            return { ...connection, ideas };
        })
        .filter((connection) => connection.ideas.length > 0);

    const filterChip = (key: string, label: string, email?: string) => {
        const isSelected = selectedFriend === key;
        return (
            <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => setSelectedFriend(key)}
                style={[styles.chip, isSelected ? styles.chipSelected : null, email ? styles.chipWithAvatar : null]}
            >
                {email && <Avatar email={email} size={24} />}
                <Text style={[styles.chipText, isSelected ? styles.chipTextSelected : null]}>{label}</Text>
            </Pressable>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <Text style={[type.largeTitle, styles.inset]}>Friends' ideas</Text>

                {!isLoading && !hasAnyIdeas && (
                    <Text style={[type.subhead, styles.inset]}>No ideas from your connections yet.</Text>
                )}

                {!isLoading && hasAnyIdeas && (
                    <>
                        <View style={styles.inset}>
                            <TextField
                                variant="search"
                                icon="magnify"
                                placeholder="Search friends and ideas"
                                value={search}
                                onChangeText={setSearch}
                                autoCapitalize="none"
                                autoCorrect={false}
                                clearButtonMode="while-editing"
                            />
                        </View>

                        {friendsWithIdeas.length > 1 && (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                                {filterChip(ALL_FRIENDS, 'All')}
                                {friendsWithIdeas.map((connection) =>
                                    filterChip(connection.email, nameFromEmail(connection.email), connection.email))}
                            </ScrollView>
                        )}

                        {visibleSections.length === 0 && (
                            <Text style={[type.subhead, styles.inset]}>No ideas match “{search}”.</Text>
                        )}

                        {visibleSections.map((connection) => (
                            <View key={connection.email} style={[styles.section, styles.inset]}>
                                <View style={styles.sectionHeader}>
                                    <Avatar email={connection.email} size={32} />
                                    <Text style={[type.headline, styles.flex]} numberOfLines={1}>{connection.email}</Text>
                                    <Text style={styles.count}>
                                        {connection.ideas.length} {connection.ideas.length === 1 ? 'idea' : 'ideas'}
                                    </Text>
                                </View>
                                {connection.ideas.map((idea, index) => (
                                    <IdeaCard key={idea.id ?? index} idea={idea} />
                                ))}
                            </View>
                        ))}
                    </>
                )}
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
        paddingTop: 20,
        paddingBottom: 32,
        gap: 16,
    },
    inset: {
        marginHorizontal: spacing.screen,
    },
    flex: {
        flex: 1,
    },
    chips: {
        paddingHorizontal: spacing.screen,
        gap: 8,
    },
    chip: {
        height: 36,
        paddingHorizontal: 16,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    chipWithAvatar: {
        paddingLeft: 6,
        paddingRight: 12,
    },
    chipSelected: {
        backgroundColor: colors.textPrimary,
        borderColor: colors.textPrimary,
    },
    chipText: {
        fontSize: 15,
        fontWeight: '500',
        color: colors.textPrimary,
    },
    chipTextSelected: {
        fontWeight: '600',
        color: colors.textOnAccent,
    },
    section: {
        gap: 10,
        paddingTop: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    count: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.textTertiary,
    },
});
