import { Firestore } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { AnimatedFAB } from "react-native-paper";
import { AppContext } from "../AppContext";
import { Idea } from "../types/Types";
import { crudListStyles } from "../shared/ApplicationStyles";
import { SwipeableItem } from "../shared/SwipeableItem";
import { FirebaseUtils } from "../util/FirebaseUtils";

const ideas: Idea[] = [];
const initialState = {
    ideas: ideas
}

export default function MyIdeas({ route, navigation }: any) {
    const appContext = useContext(AppContext);
    const [state, setState] = useState(initialState)

    let db: Firestore;


    useEffect(() => {

    }, []);

    async function onLoad(useContext: boolean = false) {

        // TODO: simplify firestore query to path based
        // let allIdeas: Idea[] = [];
        // try {
        //     allIdeas = await findAllIdeas(appContext.userInfo.email)
        // } catch (error) {
        //     console.error("Error getting idea list.", error)
        // }

        // setState({ ...state, ideas: allIdeas });

    }

    const ideasList = () => {
        return state.ideas.map((idea, index) =>
            <SwipeableItem key={index} id={idea.id} title={idea.title} description={idea.description} data={idea} icon="lightbulb"></SwipeableItem>
        );
    }

    return (
        <SafeAreaView style={crudListStyles.container}>
            <View style={crudListStyles.list}>
                <ScrollView>
                    {ideasList()}
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}
