import { Formik } from 'formik';
import { useContext, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";
import { Portal, Snackbar } from "react-native-paper";
import { AppContext } from '../AppContext';
import { Idea } from '../../../types/DataStoreTypes';
import { Button } from '../shared/Buttons';
import { TextField } from '../shared/TextField';
import { colors, spacing } from '../shared/theme';
import { createIdea } from './IdeasService';

export function AddIdea({route, navigation }: any) {

    const appContext = useContext(AppContext);
    const [state, setState] = useState({ showError: false, errorMessage: '', mode: "ADD", idea: {
        id: '',
        title: '',
        description: ''
    } });

    useEffect(() => {
        if (route.params?.idea) {
            setState({ ...state, idea: route.params.idea, mode: "EDIT"})
        }
    }, [])

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <Formik
                    initialValues={ state.idea }
                    enableReinitialize={true}
                    onSubmit={async values => {
                        if (!appContext.userInfo) {
                            setState({ ...state, showError: true, errorMessage: 'Error saving your ideas.  Please login again.' })
                        } else {

                            let newIdea: Idea = { title: values.title, description: values.description };

                            try {
                                const docRef = await createIdea(appContext.userInfo.email, newIdea);
                                newIdea.id = docRef.id

                                appContext.ideas.push(newIdea);

                            } catch (error) {
                                console.error(error);

                                setState({ ...state, showError: true, errorMessage: 'Error saving your ideas.' })
                                return;
                            }

                            navigation.navigate('MyIdeas', { refreshContent: true });
                        }
                    }}
                >
                    {({ handleChange, handleBlur, handleSubmit, values, errors, isSubmitting }) => (
                        <>
                            <TextField
                                testID="idea-title-input"
                                label="Idea name"
                                placeholder="e.g. Wool camp blanket"
                                onChangeText={handleChange('title')}
                                onBlur={handleBlur('title')}
                                value={values.title}
                                error={errors.title}
                                returnKeyType="next"
                            />
                            <TextField
                                testID="idea-description-input"
                                label="Details"
                                placeholder="Colour, size, where to find it…"
                                multiline
                                numberOfLines={3}
                                onChangeText={handleChange('description')}
                                onBlur={handleBlur('description')}
                                value={values.description}
                                error={errors.description}
                            />
                            <Button
                                testID="save-idea-button"
                                label={isSubmitting ? 'Saving…' : 'Save idea'}
                                disabled={isSubmitting}
                                onPress={() => handleSubmit()}
                                style={styles.submit}
                            />
                        </>
                    )}
                </Formik>
            </ScrollView>
            <Portal>
                <Snackbar
                    visible={state.showError}
                    onDismiss={() => { setState({ ...state, showError: false }) }}
                    duration={30000}
                >
                    {state.errorMessage}
                </Snackbar>
            </Portal>
        </KeyboardAvoidingView>
    )

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgBase,
    },
    content: {
        padding: spacing.screen,
        gap: 20,
    },
    submit: {
        marginTop: 4,
    },
});
