import { ActivityIndicator, Animated, Image, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, Vibration, View } from 'react-native'
import React, { useRef, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import { Responsive } from '../utilities/Responsive';
import { Colors } from '../utilities/AppTheme';
import { forgotPassword } from '../redux/slice/authSlice';
import { useDispatch, useSelector } from 'react-redux';

const ForgotPasswordScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const { forgotPasswordLoading, authError } = useSelector((state: any) => state.auth)
    const [showMessage, setShowMessage] = useState({
        successMsg: '',
        showMsg: false
    })
    const [focusedField, setFocusedField] = useState(null);
    const fieldPositions = useRef({});
    const scrollRef = useRef(null);
    const emailInputRef = useRef(null);
    const [errors, setErrors] = useState({});
    const timerRef = useRef(null);
    const dispatch = useDispatch();
    const focusableFields = {
        email: emailInputRef,
    };

    const focusField = (key) => {
        const ref = focusableFields[key];
        if (!ref) return;
        setTimeout(() => {
            ref.current?.focus();
        }, 300);
    };

    const scrollToField = (key) => {
        const y = fieldPositions.current[key];
        if (y !== undefined) {
            scrollRef.current?.scrollTo({
                y: Math.max(0, y - Responsive.size.hp(12)),
                animated: true,
            });
        }
    };

    const shakeAnim = useRef({
        email: new Animated.Value(0),
    }).current;

    const triggerShake = (key) => {
        const anim = shakeAnim[key];
        if (!anim) return;
        Animated.sequence([
            Animated.timing(anim, { toValue: 10, duration: 60, useNativeDriver: true }),
            Animated.timing(anim, { toValue: -10, duration: 60, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 6, duration: 60, useNativeDriver: true }),
            Animated.timing(anim, { toValue: -6, duration: 60, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]).start();
    };

    const handleResetPassword = async () => {
        let newErrors = {};
        if (!email.trim()) {
            newErrors.email = 'Email is required';
            Vibration.vibrate(50);
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                newErrors.email = 'Invalid email address';
                Vibration.vibrate(50);
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            const firstErrorKey = Object.keys(newErrors)[0];
            scrollToField(firstErrorKey);
            focusField(firstErrorKey);
            triggerShake(firstErrorKey);
            return;
        }
        setErrors({});

        Vibration.vibrate(100);
        const formattedEmail = email.trim().toLowerCase();
        try {
            await dispatch(forgotPassword(formattedEmail)).unwrap();

            setShowMessage({
                showMsg: true,
                successMsg: 'Password reset link has been sent to your email , please check you inbox or spam box, Thanks!',

            })
        } catch (error) {
            console.log("Firebase Error Code:", error.code); // Look for specific codes here
            console.log("Firebase Error Message:", error.message);

        }
        return () => { clearInterval(timerRef.current) };
    };

    return (
        <View style={[styles.container]}>
            <StatusBar barStyle={'light-content'} translucent backgroundColor={'transparent'} />

            <View style={[styles.subContainer, {
                paddingVertical: insets.top + Responsive.spacing[10],
                paddingHorizontal: Responsive.spacing[10]
            }]}>
                <View style={styles.backBtnWrapper}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backBtn}>
                        <Feather name='arrow-left' color={Colors.text.primary} size={Responsive.fontSize[30]} />
                    </TouchableOpacity>
                </View>

                <View style={styles.imageWrapper}>
                    <Image source={require('../assets/images/BotForget.png')}
                        style={styles.loginImageStyle}
                    />
                </View>

            </View>
            <KeyboardAvoidingView
                style={styles.formCardStyle}
                behavior={'padding'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <ScrollView
                    ref={scrollRef}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{
                        paddingVertical: Responsive.padding[20],
                        paddingHorizontal: Responsive.padding[30],
                        paddingBottom: Responsive.spacing[40]
                    }}
                    showsVerticalScrollIndicator={false}
                    bounces={true}
                >
                    <Text style={styles.titleText}>Forgot Password?</Text>
                    {showMessage.showMsg ? (
                        <Text style={styles.successText} accessibilityLiveRegion="polite">{showMessage.successMsg}</Text>
                    ) : <Text style={styles.subtitleText}>Enter your email address and we'll send you a link to reset your password.</Text>
                    }

                    <View onLayout={(e) => { fieldPositions.current.email = e.nativeEvent.layout.y; }} style={styles.inputWrapper}>
                        <Text style={styles.labelText}>Email address</Text>
                        <View style={[styles.emailWrapperStyle, focusedField === 'email' && styles.inputFocused, errors.email && styles.inputError]}>
                            <Feather name='mail' color={Colors.text.secondary} size={Responsive.fontSize[27]} />
                            <TextInput
                                ref={emailInputRef}
                                value={email}
                                placeholder='Enter your email'
                                style={styles.inputView}
                                keyboardType='email-address'
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    setErrors(prev => ({ ...prev, email: null }));
                                }}
                                placeholderTextColor={Colors.text.secondary}
                            />
                        </View>
                        {errors.email && (
                            <Animated.View style={{ transform: [{ translateX: shakeAnim.email || 0 }], marginLeft: Responsive.spacing[10] }}>
                                <Text style={styles.errorText} accessibilityRole="alert" accessibilityLiveRegion="assertive">{errors.email}</Text>
                            </Animated.View>
                        )}
                    </View>

                    <TouchableOpacity
                        style={styles.resetBtn}
                        onPress={handleResetPassword}
                        disabled={forgotPasswordLoading}>
                        {forgotPasswordLoading ? (
                            <>
                                <ActivityIndicator size="small" color={Colors.text.primary} />
                                <Text style={[styles.resetText, { marginLeft: Responsive.spacing[10] }]}>Sending...</Text>
                            </>
                        ) : (
                            <Text style={styles.resetText}>Send Reset Link</Text>
                        )
                        }
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backToLoginWrapper}>
                        <Text style={styles.backToLoginText}>Back to Login</Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    )
}

export default ForgotPasswordScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background
    },
    subContainer: {
        // flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center'
    },
    backBtnWrapper: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start'
    },
    backBtn: {
        backgroundColor: Colors.accent,
        padding: Responsive.padding[10],
        borderTopEndRadius: Responsive.radius[20],
        borderBottomStartRadius: Responsive.radius[20],
        justifyContent: 'center',
        alignItems: 'center'
    },
    imageWrapper: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    formCardStyle: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderTopLeftRadius: Responsive.radius[35],
        borderTopRightRadius: Responsive.radius[35],
    },
    titleText: {
        fontSize: Responsive.fontSize[28],
        fontWeight: 'bold',
        color: Colors.text.primary,
        textAlign: 'center',
        marginBottom: Responsive.spacing[10],
    },
    subtitleText: {
        fontSize: Responsive.fontSize[16],
        color: Colors.text.secondary,
        textAlign: 'center',
        marginBottom: Responsive.spacing[30],
        lineHeight: Responsive.fontSize[22],
    },
    emailWrapperStyle: {
        padding: Responsive.padding[8],
        borderRadius: Responsive.radius[20],
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Responsive.spacing[20],
        gap: Responsive.spacing[5],
        backgroundColor: Colors.surface,
        borderWidth: 0.5,
        borderColor: Colors.border.default
    },
    labelText: {
        color: Colors.text.secondary,
        fontSize: Responsive.fontSize[16],
        fontWeight: '400',
        letterSpacing: 0.5,
    },
    inputView: {
        color: Colors.text.secondary,
        fontSize: Responsive.fontSize[14],
        flex: 1
    },
    resetBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Responsive.padding[15],
        backgroundColor: Colors.accent,
        borderRadius: Responsive.radius[16],
        marginTop: Responsive.spacing[10],
        borderWidth: 0.5,
        borderColor: Colors.text.primary
    },
    resetText: {
        color: Colors.text.primary,
        fontWeight: '700',
        letterSpacing: 1,
        fontSize: Responsive.fontSize[16]
    },
    backToLoginWrapper: {
        alignItems: 'center',
        marginTop: Responsive.spacing[20],
    },
    backToLoginText: {
        fontSize: Responsive.fontSize[16],
        color: Colors.primary,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    inputWrapper: {
        marginBottom: Responsive.spacing[5]
    },
    inputFocused: {
        backgroundColor: '#2F5755',
        borderWidth: 1
    },
    inputError: {
        borderColor: Colors.border.error,
        borderWidth: 1
    },
    errorText: {
        color: Colors.status.error,
        fontSize: Responsive.fontSize[12],
        marginTop: Responsive.spacing[5]
    },
    loginImageStyle: {
        width: Responsive.size.wp(58),
        height: Responsive.size.hp(25)
    },
    successText: {
        color: Colors.text.secondary,
        fontSize: Responsive.fontSize[14],
        marginTop: Responsive.spacing[24],
        marginBottom: Responsive.spacing[8],
        textAlign: 'center',
        fontWeight: '700'
    }
})