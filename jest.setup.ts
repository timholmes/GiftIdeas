import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('@react-native-google-signin/google-signin', () => ({
	GoogleSignin: {
		configure: jest.fn(),
		isSignedIn: jest.fn().mockResolvedValue(false),
		getCurrentUser: jest.fn(),
		signIn: jest.fn(),
		signOut: jest.fn().mockResolvedValue(undefined),
	},
	statusCodes: {
		SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
	},
}));
