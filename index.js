/**
 * @format
 */
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { TextEncoder, TextDecoder } from 'text-encoding';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
import { AppRegistry, Platform, StyleSheet, View } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { Provider } from "react-redux";
import { store } from "./src/redux/store/store";
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { Responsive } from './src/utilities/Responsive';
import { BlurView } from '@react-native-community/blur';
import { getApp, initializeApp } from '@react-native-firebase/app';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import { displayLocalNotificationFromRemoteMessage } from './src/services/pushNotificationService';
import {
    initializeAppCheck,
    ReactNativeFirebaseAppCheckProvider
} from '@react-native-firebase/app-check';

const setupSecurity = async () => {
    try {
        // 1. Get the app instance
        const app = getApp();

        // 2. Setup the Provider
        const provider = new ReactNativeFirebaseAppCheckProvider();
        provider.configure({
            android: {
                // Since you are on a real device, use 'debug' for now 
                // to get the token, then 'playIntegrity' for production.
                provider: __DEV__ ? 'debug' : 'playIntegrity',
            },
        });

        // 3. Initialize (This fixes the 'call of undefined' error)
        await initializeAppCheck(app, {
            provider: provider,
            isTokenAutoRefreshEnabled: true,
        });

        console.log("✅ Security initialized!");
    } catch (error) {
        // If you see "No Firebase App", call initializeApp() before getApp()
        console.error("❌ Setup failed:", error);
    }
};

setupSecurity();

notifee.onBackgroundEvent(async ({ type, detail }) => {
    if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
        console.log('Notifee background event:', type, detail?.notification?.id);
    }
});
notifee.onForegroundEvent(async ({ type, detail }) => {
    if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
        console.log('Notifee foreground event:', type, detail?.notification?.id);
    }
});

setBackgroundMessageHandler(getMessaging(), async remoteMessage => {
    console.log('Background push message:', remoteMessage);
    await displayLocalNotificationFromRemoteMessage(remoteMessage, 'background');
});

const Root = () => {
    return (
        <Provider store={store}>
            <App />
            <Toast position='top' topOffset={50} config={toastConfig}

            // autoHide={false}

            />
        </Provider>
    )
}

const ToastGlass = ({ accentColor, children }) => (
    <View style={styles.toastShell}>
        <BlurView
            style={StyleSheet.absoluteFill}
            blurType={Platform.OS === 'ios' ? 'systemMaterial' : 'light'}
            blurAmount={10}
            reducedTransparencyFallbackColor="rgba(15, 18, 22, 0.85)"
        />
        <View style={[styles.toastAccent, { backgroundColor: accentColor }]} />
        <View style={styles.toastContent}>
            {children}
        </View>
    </View>
);

const toastConfig = {
    /* Overwrite the 'success' type or create a custom one like 'customSuccess'
    */
    success: (props) => (
        <ToastGlass accentColor="#33C774">
            <BaseToast
                {...props}
                style={styles.baseToast}
                contentContainerStyle={styles.baseToastContent}
                text1Style={styles.baseText1}
                text2Style={styles.baseText2}
            />
        </ToastGlass>
    ),

    error: (props) => (
        <ToastGlass accentColor="#FF4D6D">
            <ErrorToast
                {...props}
                style={styles.baseToast}
                contentContainerStyle={styles.baseToastContent}
                text1Style={styles.baseText1}
                text2Style={styles.baseText2}
            />
        </ToastGlass>
    )
};

const styles = StyleSheet.create({
    toastShell: {
        height: Responsive.size.hp(12),
        borderRadius: Responsive.radius[12],
        overflow: 'hidden',
        backgroundColor: 'rgba(13, 15, 19, 0.45)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.18)',
        shadowColor: '#ccc',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 18,
        elevation: 8,
    },
    toastAccent: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: Responsive.size.wp(1.2),
    },
    toastContent: {
        flex: 1,
        justifyContent: 'center',
    },
    baseToast: {
        backgroundColor: 'transparent',
        borderLeftWidth: 0,
        height: Responsive.size.hp(12),
        paddingVertical: 0,
    },
    baseToastContent: {
        paddingHorizontal: Responsive.padding[12],
    },
    baseText1: {
        fontSize: Responsive.fontSize[16],
        fontWeight: '700',
        color: '#F5F7FA',
    },
    baseText2: {
        fontSize: Responsive.fontSize[13],
        color: 'rgba(245, 247, 250, 0.8)',
    },
});
AppRegistry.registerComponent(appName, () => Root);
