import { Animated, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native';
import { Responsive } from '../utilities/Responsive';
import { Colors } from '../utilities/AppTheme';
import LottieView from 'lottie-react-native';
const WelcomeScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const buttonScale1 = useRef(new Animated.Value(1)).current;
    const buttonScale2 = useRef(new Animated.Value(1)).current;
    const animationRef = useRef(null);

    useEffect(() => {
        animationRef.current?.play();
    }, []);
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 700,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleButtonPress = (animValue, callback) => {
        Animated.timing(animValue, {
            toValue: 0.95,
            duration: 80,
            useNativeDriver: true,
        }).start(() => {
            Animated.timing(animValue, {
                toValue: 1,
                duration: 80,
                useNativeDriver: true,
            }).start();
            callback();
        });
    };
    return (
        <View style={[styles.container]}>
            <StatusBar barStyle={'light-content'} translucent backgroundColor={'transparent'} />

            <View style={[styles.subContainer, {
                paddingVertical: insets.top + Responsive.spacing[10],
                paddingHorizontal: Responsive.spacing[10]
            }]}>
                <Animated.Text
                    style={[
                        styles.welcomeText,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    Let's Get Started
                </Animated.Text>
                <Animated.View
                    style={[
                        styles.charactorView,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }]
                        }
                    ]}
                >
                    {/* <Image
                        source={require('../assets/images/Charactor.png')}
                        style={styles.characterImageStyle}
                    /> */}
                    <LottieView
                        ref={animationRef}
                        source={require('../assets/lottie/welcome-bot.json')}
                        autoPlay
                        loop
                        style={{ width: 220, height: 220 }}
                        renderMode="SOFTWARE"
                    />
                </Animated.View>
                <Animated.View
                    style={[
                        styles.signUpBtnWrapper,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: buttonScale1 }]
                        }
                    ]}
                >
                    <TouchableOpacity
                        onPress={() => handleButtonPress(buttonScale1, () => navigation.navigate('SignUpScreen'))}
                        style={styles.signUpBtn}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.signUpText}>Create an account</Text>
                    </TouchableOpacity>
                </Animated.View>
                <Animated.View
                    style={[
                        styles.loginBtnWrapper,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: buttonScale2 }]
                        }
                    ]}
                >
                    <TouchableOpacity
                        onPress={() => handleButtonPress(buttonScale2, () => navigation.navigate('LoginScreen'))}
                        style={styles.loginBtn}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.loginText}>Log In</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Terms and Privacy */}
                <View style={styles.termsContainer}>
                    <Text style={styles.termsText}>By continuing, you agree to our </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('TermsConditions' as never)}>
                        <Text style={styles.termsLink}>Terms & Conditions</Text>
                    </TouchableOpacity>
                    <Text style={styles.termsText}> and </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy' as never)}>
                        <Text style={styles.termsLink}>Privacy Policy</Text>
                    </TouchableOpacity>
                </View>
            </View>

        </View>
    )
}

export default WelcomeScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background
    },
    welcomeText: {
        textAlign: 'center',
        color: Colors.text.inverse,
        fontSize: Responsive.fontSize[32],
        fontWeight: 'bold',
        letterSpacing: 1.5,
        marginBottom: Responsive.spacing[20],
    },
    subContainer: {
        flex: 1,
        justifyContent: 'center',
        // alignItems: 'center'
    },
    charactorView: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    signUpBtnWrapper: {
        marginVertical: Responsive.spacing[10],
    },
    signUpBtn: {
        paddingVertical: Responsive.padding[15],
        backgroundColor: Colors.accent,
        paddingHorizontal: Responsive.padding[10],
        width: '100%',
        borderRadius: Responsive.radius[25],
        elevation: 5,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    signUpText: {
        fontSize: Responsive.fontSize[18],
        color: Colors.text.primary,
        fontWeight: 'bold',
        textAlign: 'center',
        letterSpacing: 1,
    },
    alreadyLogin: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: Responsive.padding[15],
        marginTop: Responsive.spacing[10],
    },
    loginBtnWrapper: {
        marginTop: Responsive.spacing[15],
        alignItems: 'center',
    },
    loginBtn: {
        paddingVertical: Responsive.padding[15],
        paddingHorizontal: Responsive.padding[10],
        backgroundColor: Colors.background,
        width: '100%',
        borderRadius: Responsive.radius[25],
        marginBottom: Responsive.spacing[8],
        elevation: 3,
        shadowColor: Colors.shadow,
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.2,
        // shadowRadius: 2,
        borderWidth: 1,
        borderColor: Colors.surface,
    },
    loginText: {
        fontSize: Responsive.fontSize[18],
        color: Colors.surface,
        fontWeight: 'bold',
        textAlign: 'center',
        letterSpacing: 1,
    },
    alreadyText: {
        textAlign: 'center',
        color: Colors.text.inverse,
        fontWeight: '500',
        fontSize: Responsive.fontSize[15],
        opacity: 0.95,
    },
    characterImageStyle: {
        width: Responsive.size.wp(70),
        height: Responsive.size.hp(35)
    },
    termsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Responsive.spacing[20],
        paddingHorizontal: Responsive.padding[10],
    },
    termsText: {
        fontSize: Responsive.fontSize[12],
        color: Colors.text.inverse,
        opacity: 0.8,
    },
    termsLink: {
        fontSize: Responsive.fontSize[12],
        color: Colors.accent,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
})