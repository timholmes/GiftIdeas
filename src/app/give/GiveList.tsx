import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useContext, useState } from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import { List, Text } from "react-native-paper";
import { AppContext } from "../AppContext";
import { crudListStyles } from "../shared/ApplicationStyles";
import { useConnections } from "../connections/useConnections";
import { ConnectionIdeas, findIdeasForConnections } from "../ideas/IdeasService";

export default function GiveList({ route, navigation }: any) {
    const appContext = useContext(AppContext);
    const { activeConnections } = useConnections(appContext.userInfo?.email);
    const [connectionIdeas, setConnectionIdeas] = useState<ConnectionIdeas[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

    const hasAnyIdeas = connectionIdeas.some((connection) => connection.ideas.length > 0);

    const connectionSections = () => {
        return connectionIdeas
            .filter((connection) => connection.ideas.length > 0)
            .map((connection) => (
                <View key={connection.email}>
                    <Text style={crudListStyles.titleText}>{connection.email}</Text>
                    {connection.ideas.map((idea, index) => (
                        <List.Item
                            key={idea.id ?? index}
                            title={idea.title}
                            description={idea.description}
                            left={(props) => <List.Icon {...props} icon="lightbulb" />}
                        />
                    ))}
                </View>
            ));
    };

    return (
        <SafeAreaView style={crudListStyles.container}>
            <View style={crudListStyles.list}>
                <ScrollView>
                    {!isLoading && !hasAnyIdeas && (
                        <Text style={crudListStyles.titleText}>No ideas from your connections yet.</Text>
                    )}
                    {!isLoading && hasAnyIdeas && connectionSections()}
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}
