import { Formik } from 'formik';
import { useContext } from 'react';
import { GestureResponderEvent, SafeAreaView, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import * as Yup from 'yup';
import { AppContext } from '../AppContext';
import { crudAddStyles, crudListStyles } from '../shared/ApplicationStyles';
import { addConnection } from './ConnectionsService';

export function AddConnection({route, navigation }: any) {

    const appContext = useContext(AppContext);
    // const [state, setState] = useState({ ...appContext })

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
                        
                        if(!appContext.userInfo?.email) {
                            throw new Error("Invalid login.  Cannot add new connection.")
                        }

                        try {
                            addConnection(appContext.userInfo?.email, values.email.toLowerCase())
                            
                        } catch (error) {
                            // TODO - better error handling
                            console.error(error);
                        }

                        appContext.canView.push(values.email.toLowerCase());

                        navigation.navigate('Connect', { refreshContent: true });
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
                        />
                        {errors.email ? <Text>{errors.email}</Text> : null}
                        <Button mode="contained" onPress={handleSubmit as (e?: GestureResponderEvent) => void}>
                            Submit
                        </Button>
                    </View>
                )}
            </Formik>
            {/* <Portal>
                <Snackbar
                    visible={state.showError}
                    onDismiss={() => { setState({ ...state, showError: false }) }}
                    duration={30000}
                >
                    {state.errorMessage}
                </Snackbar>
            </Portal> */}
        </View>
        </SafeAreaView>
    )

}
