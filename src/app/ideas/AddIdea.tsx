import { Formik } from 'formik';
import { useContext, useEffect, useState } from 'react';
import { GestureResponderEvent, View } from "react-native";
import { Button, Portal, Snackbar, Text, TextInput } from "react-native-paper";
import * as Yup from 'yup';
import { AppContext } from '../AppContext';
import { Idea } from '../types/Types';
import { crudAddStyles } from '../shared/ApplicationStyles';
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

    const validationSchema = Yup.object().shape({
        title: Yup.string().required(),
        description: Yup.string().required()
    });

    return (
        <View>
            <Formik
                initialValues={ state.idea }
                // validationSchema={validationSchema}
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
                {({ handleChange, handleBlur, handleSubmit, values, errors }) => (
                    <View style={{ ...crudAddStyles.container }}>
                        <TextInput
                            style={{ ...crudAddStyles.input }}
                            label="Title"
                            mode="outlined"
                            onChangeText={handleChange('title')}
                            onBlur={handleBlur('title')}
                            value={values.title}
                        />
                        {errors.title ? <Text>{errors.title}</Text> : null}
                        <TextInput
                            style={{ ...crudAddStyles.input, height: 80 }}
                            label="Description"
                            mode="outlined"
                            multiline
                            numberOfLines={3}
                            onChangeText={handleChange('description')}
                            onBlur={handleBlur('description')}
                            value={values.description}
                        />
                        <Button mode="contained" onPress={handleSubmit as (e?: GestureResponderEvent) => void}>
                            Submit
                        </Button>
                    </View>
                )}
            </Formik>
            <Portal>
                <Snackbar
                    visible={state.showError}
                    onDismiss={() => { setState({ ...state, showError: false }) }}
                    duration={30000}
                >
                    {state.errorMessage}
                </Snackbar>
            </Portal>
        </View>
    )

}
