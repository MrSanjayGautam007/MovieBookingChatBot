
import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NetInfo from "@react-native-community/netinfo";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import RNBootSplash from "react-native-bootsplash";
import { Responsive } from '../utilities/Responsive';
import { Colors } from '../utilities/AppTheme';
import GradientBackground from '../components/GradientBackground';
const NoInternetScreen = () => {
    const insets = useSafeAreaInsets();
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {

        const hideSplash = async () => {
            await RNBootSplash.hide({ fade: true });
        };
        hideSplash();
    }, []);
    const handleRetry = async () => {
        setIsRefreshing(true);
        await NetInfo.refresh();
        setTimeout(() => {
            setIsRefreshing(false);
        }, 1000);
    };

    return (
        <GradientBackground>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <View style={styles.content}>
                <MaterialIcons
                    name="wifi-off"
                    size={Responsive.fontSize[80]}
                    color={Colors.text.secondary}
                    style={styles.icon}
                />

                <Text style={styles.title}>No Internet Connection</Text>

                <Text style={styles.description}>
                    It seems you are offline. Please check your connection and try again to continue.
                </Text>

                <TouchableOpacity
                    style={[styles.button, isRefreshing && styles.buttonDisabled]}
                    onPress={handleRetry}
                    disabled={isRefreshing}
                    activeOpacity={0.8}
                    accessibilityLabel="Retry network connection"
                    accessibilityRole="button"
                    accessibilityHint="Triggers a re-check of your internet status"
                >
                    {isRefreshing ? (
                        <ActivityIndicator color={Colors.text.inverse} size="small" />
                    ) : (
                        <Text style={styles.buttonText}>Try Again</Text>
                    )}
                </TouchableOpacity>
            </View>
        </GradientBackground>
    );
};

export default NoInternetScreen;

const styles = StyleSheet.create({
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Responsive.spacing[30],
    },
    icon: {
        marginBottom: Responsive.spacing[30],
        // opacity: 0.8,
    },
    title: {
        fontSize: Responsive.fontSize[28],
        fontWeight: 'bold',
        color: Colors.text.primary,
        marginBottom: Responsive.spacing[15],
        textAlign: 'center',
    },
    description: {
        fontSize: Responsive.fontSize[16],
        color: Colors.text.secondary,
        textAlign: 'center',
        marginBottom: Responsive.spacing[40],
        lineHeight: Responsive.fontSize[24],
        paddingHorizontal: Responsive.spacing[10],
    },
    button: {
        backgroundColor: Colors.primary,
        paddingVertical: Responsive.padding[15],
        paddingHorizontal: Responsive.padding[50],
        borderRadius: Responsive.radius[12],
        elevation: 4,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: Colors.text.inverse,
        fontSize: Responsive.fontSize[16],
        fontWeight: '600',
        letterSpacing: 1,
    },
});