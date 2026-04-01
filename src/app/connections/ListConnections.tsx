import { useFocusEffect } from "@react-navigation/native";
import { Firestore } from "firebase/firestore";
import { useCallback, useContext, useEffect, useState } from "react";
import { DeviceEventEmitter, SafeAreaView, ScrollView, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { AnimatedFAB, Text } from "react-native-paper";
import { AppContext } from "../AppContext";
import { initialContext } from "../types/Types";
import { crudListStyles } from "../shared/ApplicationStyles";
import { SwipeableItem, SwipeableItemEvents } from "../shared/SwipeableItem";
import { addConnection, deleteConnectionByEmail, findAllConnections } from "./ConnectionsService";

export default function ListConnections({ route, navigation }: any) {
    const appContext = useContext(AppContext);
    const [state, setState] = useState(initialContext)

    let db: Firestore;

    useEffect(() => {

        onLoad().then(() => {
            DeviceEventEmitter.addListener(SwipeableItemEvents.DELETE_PRESS, (swipeable: Swipeable) => { handleDeletePress(swipeable) });
            DeviceEventEmitter.addListener(SwipeableItemEvents.ITEM_PRESS, (swipeable: Swipeable) => { return; });  // catch it but do nothing 

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

    //         }, [route.params]
    //     )
    // );

    async function onLoad(useContext: boolean = false) {

        // console.log(`list connections: load useContext? ${useContext}`);

        // if (useContext) {
        //     setState( { ...appContext });
        // } else {    // reload data from firebase
            
            // TODO: show a a critical error and force login
            // if (!appContext.userInfo) {
            //     console.error("Unexpected userInfo is empty.");
            //     return;
            // }

            // try {
            //     let viewUsers: string[] = await findAllConnections(appContext.userInfo.email)
                
            //     console.log('connections found for user', appContext.userInfo.email, viewUsers);

            //     setState({ ...state, canView: viewUsers })
            //     appContext.canView = viewUsers;
                
            // } catch (error) {
            //     console.error("Cannot get list of connections", error);
            // }

        // }
    }
    
    async function handleDeletePress(swipeable: Swipeable) {
        const emailToDelete = swipeable.props.id;

        if (emailToDelete && appContext.userInfo?.email) {
            try {
                await deleteConnectionByEmail(appContext.userInfo.email, emailToDelete)

                onLoad(false)
            } catch (error) {
                console.error(error);
            }
        }
    }

    const connectionsList = () => {
        return state.canView.map((email, index) =>
            // <SwipeableItem id={item} key={index}></SwipeableItem>
            <SwipeableItem key={index} id={email} title={email} description="" data="item" icon="account"></SwipeableItem>
        );
    }

    const titleMessage = () => {
        if(state.canView.length > 0) {
            return <Text style={ crudListStyles.titleText }>Below is the list of users that have access to your ideas.</Text>
        } else {
            return <Text style={ crudListStyles.titleText }>No connections yet.  Add some below!</Text>
        }
    }

    return (
        <SafeAreaView style={crudListStyles.container}>
            {titleMessage()}
            <View style={crudListStyles.list}>
                <ScrollView>
                {connectionsList()}
                </ScrollView>
                <AnimatedFAB
                    icon={'plus'}
                    label={'Label'}
                    extended={false}
                    onPress={() => navigation.navigate('AddConnection')}
                    visible={true}
                    animateFrom={'right'}
                    iconMode={'static'}
                    style={[crudListStyles.fabStyle]}
                />
            </View>
        </SafeAreaView>
    )
}