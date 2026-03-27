import { useFocusEffect } from "@react-navigation/native";
import { FirebaseError } from "firebase/app";
import { Firestore, QuerySnapshot, collection, deleteDoc, doc, getDoc, getDocs } from "firebase/firestore";
import { useCallback, useContext, useEffect, useState } from "react";
import { DeviceEventEmitter, SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { AnimatedFAB } from "react-native-paper";
import { AppContext } from "../AppContext";
import { Idea } from "../Types";
import { FirebaseUtils } from "../util/FirebaseUtils";
import { SwipeableItem, SwipeableItemEvents } from "../shared/SwipeableItem";
import { deleteIdea, findAllIdeas } from "./IdeasService";
import { crudListStyles } from "../shared/ApplicationStyles";

const ideas: Idea[] = [];
const initialState = {
    ideas: ideas
}

export default function MyIdeas({ route, navigation }: any) {
    const appContext = useContext(AppContext);
    const [state, setState] = useState(initialState)

    let db: Firestore;

    enum FirestoreErrorCodes {
        PERMISSION_DENIED = 'permission-denied'
    }

    useEffect(() => {
        onLoad().then(() => {
            console.log('ideas loaded');
            DeviceEventEmitter.addListener(SwipeableItemEvents.DELETE_PRESS, (swipeable: Swipeable) => { handleDeletePress(swipeable) })
            DeviceEventEmitter.addListener(SwipeableItemEvents.ITEM_PRESS, (idea: Idea) => { handleItemPress(idea) })
        
            return () => {
            DeviceEventEmitter.removeAllListeners();
            };
        });
    
      }, []);

    // called when params are changed.  1st - when params are undefined on load, 2nd - when navigating back from another screen
    // useFocusEffect(
    //     useCallback(
    //         () => {
    //             if (route.params && route.params.refreshContent) {
    //                 onLoad(true);
    //             } else {
    //                 onLoad();
    //             }

    //         }, [route.params])
    // );

    async function onLoad(useContext: boolean = false) {
        console.log(`my ideas: load useContext? ${useContext}`);

        // if (useContext) {

        //     setState({ ...appContext });

        // } else {    // reload data from firebase

            // TODO: show a a critical error and force login
            if (!appContext.userInfo) {
                console.error('User info is missing.')
                return;
            }

            // TODO: simplify firestore query to path based
            let allIdeas: Idea[] = [];
            try {
                allIdeas = await findAllIdeas(appContext.userInfo.email)
            } catch (error) {
                console.error("Error getting idea list.", error)
            }

            setState({ ...state, ideas: allIdeas });
    
            appContext.ideas = allIdeas;
        // }
    }
    
    async function handleDeletePress(swipeable: Swipeable) {
        const id: string | undefined = swipeable?.props?.id?.toString()
        if (id && appContext.userInfo?.email) {

            db = FirebaseUtils.getFirestoreDatabase();
            try {
                await deleteIdea(appContext.userInfo?.email, id)

                onLoad(false)
            } catch (error) {
                console.error(error);
            }
        } else {
            console.error("Unable to delete idea. Missing id or email")
        }
    }

    const handleItemPress = (idea: any) => {
        navigation.navigate('AddIdea', { idea: idea})
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
                <AnimatedFAB
                    icon={'plus'}
                    label={'Label'}
                    extended={false}
                    onPress={() => navigation.navigate('AddIdea')}
                    visible={true}
                    animateFrom={'right'}
                    iconMode={'static'}
                    style={[crudListStyles.fabStyle]}
                />
            </View>
        </SafeAreaView>
    )
}
