import { Formik } from 'formik';
import { useContext, useState } from 'react';
import { GestureResponderEvent, SafeAreaView, View } from "react-native";
import { Button, Snackbar, Text, TextInput } from "react-native-paper";
import * as Yup from 'yup';
import { AppContext } from '../AppContext';
import { crudAddStyles, crudListStyles } from '../shared/ApplicationStyles';
import { sendConnectionRequest } from './ConnectionsService';

function getFunctionsErrorCode(error: unknown): string | undefined {
    if (error && typeof error === 'object' && 'code' in error) {
        return (error as { code: unknown }).code as string;
    }
    return undefined;
}

// Maps sendConnectionRequest failures to their required user-facing message.
// The "functions/not-found" message is intentionally generic — it must not
// confirm or deny that an account exists for the entered email (FR-004).
function getSendConnectionRequestErrorMessage(error: unknown): string {
    switch (getFunctionsErrorCode(error)) {
        case 'functions/failed-precondition':
            return "You can't add yourself as a connection.";
        case 'functions/already-exists':
            return "You're already connected, or a request is already pending, with that email.";
        case 'functions/not-found':
            return "Couldn't send request. Please double-check the email and try again.";
        case 'functions/invalid-argument':
            return "Please enter a valid email address.";
        default:
            return "Something went wrong sending your request. Please try again.";
    }
}

export function AddConnection({route, navigation }: any) {

    const appContext = useContext(AppContext);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validationSchema = Yup.object().shape({
        email: Yup.string().email().required()
    });

    return (
        <SafeAreaView style={crudListStyles.container}>
            <Text>Enter the person's email to connect with them.  Once you are connected you will see each other's ideas.</Text>
        <View>
            <Formik
                initialValues={{ email: "" }}
                validationSchema={validationSchema}
                enableReinitialize={true}
                onSubmit={async values => {
                        if (!appContext.userInfo?.email) {
                            setSnackbarMessage("Your account email is not available. Please sign out and sign in again.");
                            setSnackbarVisible(true);
                            return;
                        }

                        setIsSubmitting(true);

                        try {
                            await sendConnectionRequest(values.email.toLowerCase());
                            navigation.navigate('Connect');
                        } catch (error) {
                            setSnackbarMessage(getSendConnectionRequestErrorMessage(error));
                            setSnackbarVisible(true);
                        } finally {
                            setIsSubmitting(false);
                        }
                }}
            >
                {({ handleChange, handleBlur, handleSubmit, values, errors }) => (
                    <View style={{ ...crudAddStyles.container }}>
                        <TextInput
                            style={{ ...crudAddStyles.input }}
                            label="Email"
                            mode="outlined"
                            onChangeText={handleChange('email')}
                            onBlur={handleBlur('email')}
                            value={values.email}
                            editable={!isSubmitting}
                        />
                        {errors.email ? <Text>{errors.email}</Text> : null}
                        <Button
                            mode="contained"
                            onPress={handleSubmit as (e?: GestureResponderEvent) => void}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </Button>
                    </View>
                )}
            </Formik>
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={4000}
            >
                {snackbarMessage}
            </Snackbar>
        </View>
        </SafeAreaView>
    )

}
