import { Formik } from 'formik';
import { useContext, useState } from 'react';
import { GestureResponderEvent, SafeAreaView, View } from "react-native";
import { Button, Snackbar, Text, TextInput } from "react-native-paper";
import * as Yup from 'yup';
import { AppContext } from '../AppContext';
import { crudAddStyles, crudListStyles } from '../shared/ApplicationStyles';
import { addConnection } from './ConnectionsService';

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
                            await addConnection(appContext.userInfo.email, values.email.toLowerCase());
                            navigation.navigate('Connect', { refreshContent: true });
                        } catch (error) {
                            const errorMessage = error instanceof Error ? error.message : 'Failed to add connection.';
                            setSnackbarMessage(errorMessage);
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
