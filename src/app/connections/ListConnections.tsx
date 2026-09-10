import { useContext, useEffect } from "react";
import { DeviceEventEmitter, SafeAreaView, ScrollView, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { AnimatedFAB, Button, List, Text } from "react-native-paper";
import { AppContext } from "../AppContext";
import { crudListStyles } from "../shared/ApplicationStyles";
import { SwipeableItem, SwipeableItemEvents } from "../shared/SwipeableItem";
import { acceptConnectionRequest, cancelConnectionRequest, declineConnectionRequest, deleteConnectionByEmail } from "./ConnectionsService";
import { useConnections } from "./useConnections";

export default function ListConnections({ route, navigation }: any) {
    const appContext = useContext(AppContext);
    const { activeConnections, incomingRequests, outgoingRequests } = useConnections(appContext.userInfo?.email);

    useEffect(() => {
        const deleteSubscription = DeviceEventEmitter.addListener(SwipeableItemEvents.DELETE_PRESS, (swipeable: Swipeable) => { handleDeletePress(swipeable) });
        const itemSubscription = DeviceEventEmitter.addListener(SwipeableItemEvents.ITEM_PRESS, (swipeable: Swipeable) => { return; });  // catch it but do nothing

        return () => {
            deleteSubscription.remove();
            itemSubscription.remove();
        };
    }, [appContext.userInfo?.email]);

    async function handleDeletePress(swipeable: Swipeable) {
        const emailToDelete = swipeable.props.id;

        if (emailToDelete && appContext.userInfo?.email) {
            try {
                await deleteConnectionByEmail(appContext.userInfo.email, emailToDelete)
            } catch (error) {
                console.error(error);
            }
        }
    }

    async function handleCancelPress(toEmail: string) {
        try {
            await cancelConnectionRequest(toEmail);
        } catch (error) {
            console.error(error);
        }
    }

    async function handleAcceptPress(fromEmail: string) {
        try {
            await acceptConnectionRequest(fromEmail);
        } catch (error) {
            console.error(error);
        }
    }

    async function handleDeclinePress(fromEmail: string) {
        try {
            await declineConnectionRequest(fromEmail);
        } catch (error) {
            console.error(error);
        }
    }

    const activeConnectionsList = () => {
        if (activeConnections.length === 0) {
            return null;
        }

        return (
            <>
                <Text style={crudListStyles.titleText}>Active Connections</Text>
                {activeConnections.map((email, index) =>
                    <SwipeableItem key={index} id={email} title={email} description="" data="item" icon="account"></SwipeableItem>
                )}
            </>
        );
    }

    const pendingSentList = () => {
        if (outgoingRequests.length === 0) {
            return null;
        }

        return (
            <>
                <Text style={crudListStyles.titleText}>Pending (sent by you)</Text>
                {outgoingRequests.map((request, index) =>
                    <List.Item
                        key={index}
                        title={request.otherEmail}
                        description="Waiting for them to respond"
                        left={props => <List.Icon {...props} icon="clock-outline" />}
                        right={() => <Button onPress={() => handleCancelPress(request.otherEmail)}>Cancel</Button>}
                    />
                )}
            </>
        );
    }

    const pendingReceivedList = () => {
        if (incomingRequests.length === 0) {
            return null;
        }

        return (
            <>
                <Text style={crudListStyles.titleText}>Pending (received)</Text>
                {incomingRequests.map((request, index) =>
                    <List.Item
                        id="invitation-list-item"
                        key={index}
                        title={request.otherEmail}
                        description="Wants to connect with you"
                        left={props => <List.Icon {...props} icon="account-clock" />}
                        right={() => (
                            <View style={{ flexDirection: 'row' }}>
                                <Button onPress={() => handleAcceptPress(request.otherEmail)}>Accept</Button>
                                <Button onPress={() => handleDeclinePress(request.otherEmail)}>Decline</Button>
                            </View>
                        )}
                    />
                )}
            </>
        );
    }

    const hasNoConnectionsOrRequests =
        activeConnections.length === 0 &&
        incomingRequests.length === 0 &&
        outgoingRequests.length === 0;

    const titleMessage = () => {
        if (hasNoConnectionsOrRequests) {
            return <Text style={ crudListStyles.titleText }>No connections yet.  Add some below!</Text>
        }
        return null;
    }

    return (
        <SafeAreaView style={crudListStyles.container}>
            {titleMessage()}
            <View style={crudListStyles.list}>
                <ScrollView>
                {activeConnectionsList()}
                {pendingReceivedList()}
                {pendingSentList()}
                </ScrollView>
                <AnimatedFAB
                    testID="animated-fab"
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
