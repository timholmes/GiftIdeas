import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Formik } from "formik";
import { useContext, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Snackbar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Yup from 'yup';
import { AppContext } from "../AppContext";
import { Avatar, nameFromEmail } from "../shared/Avatar";
import { Button, IconButton } from "../shared/Buttons";
import { SwipeToDelete } from "../shared/SwipeableItem";
import { TextField } from "../shared/TextField";
import { colors, radius, spacing, type } from "../shared/theme";
import {
    acceptConnectionRequest,
    cancelConnectionRequest,
    declineConnectionRequest,
    deleteConnectionByEmail,
    getSendConnectionRequestErrorMessage,
    sendConnectionRequest
} from "./ConnectionsService";
import { useConnections } from "./useConnections";

const validationSchema = Yup.object().shape({
    email: Yup.string().email('Please enter a valid email address.').required('Enter an email address.')
});

export default function ListConnections({ route, navigation }: any) {
    const appContext = useContext(AppContext);
    const { activeConnections, incomingRequests, outgoingRequests } = useConnections(appContext.userInfo?.email);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    async function handleDeletePress(emailToDelete: string) {
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

    const addFriendForm = () => (
        <Formik
            initialValues={{ email: "" }}
            validationSchema={validationSchema}
            validateOnChange={false}
            validateOnBlur={false}
            onSubmit={async (values, { resetForm }) => {
                if (!appContext.userInfo?.email) {
                    setSnackbarMessage("Your account email is not available. Please sign out and sign in again.");
                    return;
                }

                try {
                    await sendConnectionRequest(values.email.trim().toLowerCase());
                    resetForm();
                } catch (error) {
                    setSnackbarMessage(getSendConnectionRequestErrorMessage(error));
                }
            }}
        >
            {({ handleChange, handleSubmit, values, errors, isSubmitting }) => (
                <View style={styles.formSection}>
                    <Text style={styles.formLabel}>Add a friend by email</Text>
                    <View style={styles.formRow}>
                        <View style={styles.flex}>
                            <TextField
                                testID="add-connection-email"
                                icon="email-outline"
                                accessibilityLabel="Friend's email"
                                placeholder="name@example.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                autoComplete="email"
                                returnKeyType="send"
                                onSubmitEditing={() => handleSubmit()}
                                onChangeText={handleChange('email')}
                                value={values.email}
                                editable={!isSubmitting}
                            />
                        </View>
                        <Button
                            testID="send-connection-request-button"
                            label={isSubmitting ? 'Sending…' : 'Send'}
                            disabled={isSubmitting}
                            onPress={() => handleSubmit()}
                        />
                    </View>
                    <Text style={errors.email ? styles.formError : type.footnote}>
                        {errors.email ?? "They'll get a request to connect. Nothing is shared until they accept."}
                    </Text>
                </View>
            )}
        </Formik>
    );

    const pendingReceivedList = () => {
        if (incomingRequests.length === 0) {
            return null;
        }

        return (
            <View style={styles.section}>
                <Text style={type.sectionLabel}>Requests · {incomingRequests.length}</Text>
                {incomingRequests.map((request) =>
                    <View key={request.otherEmail} testID="invitation-list-item" style={styles.requestCard}>
                        <Avatar email={request.otherEmail} size={44} />
                        <View style={styles.flex}>
                            <Text style={type.headline} numberOfLines={1}>{nameFromEmail(request.otherEmail)}</Text>
                            <Text style={styles.email} numberOfLines={1}>{request.otherEmail}</Text>
                        </View>
                        <IconButton
                            icon="close"
                            variant="outline"
                            size={40}
                            accessibilityLabel={`Decline ${request.otherEmail}`}
                            onPress={() => handleDeclinePress(request.otherEmail)}
                        />
                        <Button
                            label="Accept"
                            icon="check"
                            variant="accept"
                            size="small"
                            accessibilityLabel={`Accept ${request.otherEmail}`}
                            onPress={() => handleAcceptPress(request.otherEmail)}
                        />
                    </View>
                )}
            </View>
        );
    }

    const pendingSentList = () => {
        if (outgoingRequests.length === 0) {
            return null;
        }

        return (
            <View style={styles.section}>
                <Text style={type.sectionLabel}>Sent · {outgoingRequests.length}</Text>
                <View style={styles.list}>
                    {outgoingRequests.map((request, index) =>
                        <View key={request.otherEmail}>
                            {index > 0 && <View style={styles.divider} />}
                            <View testID="sent-request-item" style={styles.listRow}>
                                <View style={styles.pendingAvatar}>
                                    <MaterialCommunityIcons name="email-outline" size={20} color={colors.textTertiary} />
                                </View>
                                <View style={styles.flex}>
                                    <Text style={type.headline} numberOfLines={1}>{request.otherEmail}</Text>
                                    <Text style={styles.email}>Waiting for them to respond</Text>
                                </View>
                                <Button
                                    label="Cancel"
                                    variant="tertiary"
                                    size="small"
                                    accessibilityLabel={`Cancel request to ${request.otherEmail}`}
                                    onPress={() => handleCancelPress(request.otherEmail)}
                                />
                            </View>
                        </View>
                    )}
                </View>
            </View>
        );
    }

    const activeConnectionsList = () => (
        <View style={styles.section}>
            <Text style={type.sectionLabel}>Friends · {activeConnections.length}</Text>
            {activeConnections.length === 0
                ? <Text style={type.subhead}>No connections yet. Add someone above!</Text>
                : activeConnections.map((email) =>
                    <SwipeToDelete key={email} deleteLabel="Remove" onDelete={() => handleDeletePress(email)}>
                        <View style={styles.friendRow}>
                            <Avatar email={email} size={40} />
                            <View style={styles.flex}>
                                <Text style={type.headline} numberOfLines={1}>{nameFromEmail(email)}</Text>
                                <Text style={styles.email} numberOfLines={1}>{email}</Text>
                            </View>
                        </View>
                    </SwipeToDelete>
                )}
            {activeConnections.length > 0 && <Text style={type.footnote}>Swipe left on a friend to remove them.</Text>}
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <Text style={type.largeTitle}>Connections</Text>
                    {addFriendForm()}
                    {pendingReceivedList()}
                    {pendingSentList()}
                    {activeConnectionsList()}
                </ScrollView>
            </KeyboardAvoidingView>
            <Snackbar
                visible={snackbarMessage !== ''}
                onDismiss={() => setSnackbarMessage('')}
                duration={4000}
            >
                {snackbarMessage}
            </Snackbar>
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
        gap: 24,
    },
    flex: {
        flex: 1,
        minWidth: 0,
    },
    formSection: {
        gap: 8,
    },
    formLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    formRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    formError: {
        fontSize: 13,
        color: colors.danger,
    },
    section: {
        gap: 10,
    },
    email: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.textSecondary,
    },
    requestCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: radius.card,
        backgroundColor: colors.bgSurface,
    },
    list: {
        backgroundColor: colors.bgSurface,
        borderRadius: radius.card,
        paddingVertical: 4,
    },
    listRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        minHeight: 64,
        paddingLeft: 16,
        paddingRight: 6,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.divider,
        marginLeft: 70,
    },
    pendingAvatar: {
        width: 40,
        height: 40,
        borderRadius: 999,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    friendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        minHeight: 64,
        paddingHorizontal: 16,
        borderRadius: radius.card,
        backgroundColor: colors.bgSurface,
    },
});
