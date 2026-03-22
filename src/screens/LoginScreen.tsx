import { ActivityIndicator, Animated, Image, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, Vibration, View, ToastAndroid } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import { Responsive } from '../utilities/Responsive';
import { Colors } from '../utilities/AppTheme';
import { useDispatch, useSelector } from 'react-redux';
import { getApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import { signInWithPhoneNumber } from '@react-native-firebase/auth';
import { loginWithEmail, loginWithGoogle, verifyOtpAndLogin } from '../redux/slice/authSlice';
import Toast from 'react-native-toast-message';

const LoginScreen = () => {
    const getAuth = () => auth(getApp());
    const { loginLoading, error, googleLoginLoading, otpVerifyLoading } = useSelector((state: any) => state.auth)
    // console.log('otpverifyloading', otpVerifyLoading);
    // console.log('Google Loading', googleLoginLoading);


    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const [loginType, setLoginType] = useState('email'); // 'email' or 'phone'
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');

    // Phone Auth Flow States
    const [confirmation, setConfirmation] = useState(null);
    const [otp, setOtp] = useState('');

    const [showOtpModal, setShowOtpModal] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const fieldPositions = useRef({});
    const scrollRef = useRef(null);
    const emailInputRef = useRef(null);
    const phoneInputRef = useRef(null);
    const passwordInputRef = useRef(null);
    const otpInputRef = useRef(null);
    const [errors, setErrors] = useState({});
    const timerRef = useRef(null);
    const [showPassword, setShowPassword] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);
    const otpTimerRef = useRef(null);
    const [countryCode, setCountryCode] = useState('+91');
    const [sendOtpLoading, setSendOtpLoading] = useState(false)
    const dispatch = useDispatch();

    const isLoading = loginLoading || sendOtpLoading;

    const focusableFields = {
        email: emailInputRef,
        phone: phoneInputRef,
        password: passwordInputRef,
        otp: otpInputRef,
    };

    const focusField = (key: string) => {
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
        phone: new Animated.Value(0),
        password: new Animated.Value(0),
        otp: new Animated.Value(0),
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

    const handleLogin = async () => {
        let newErrors = {};

        if (loginType === 'email') {
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
            if (!password.trim()) {
                newErrors.password = 'Password is required';
                Vibration.vibrate(50);
            }
        } else {
            if (!phone.trim()) {
                newErrors.phone = 'Phone number is required';
                Vibration.vibrate(50);
            } else {
                const phoneRegex = /^[+]?[1-9]\d{1,14}$/;
                if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
                    newErrors.phone = 'Invalid phone number';
                    Vibration.vibrate(50);
                }
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

        if (loginType === 'phone') {
            handleSendOtp()

        } else {
            dispatch(loginWithEmail({ email: email.trim(), password: password.trim() }));
            Vibration.vibrate(100);
        }

        return () => { clearInterval(timerRef.current) };
    };
    const handleGoogleLogin = () => {
        dispatch(loginWithGoogle())
    }
    const startOtpTimer = () => {
        setOtpTimer(60);
        otpTimerRef.current = setInterval(() => {
            setOtpTimer(prev => {
                if (prev <= 1) {
                    clearInterval(otpTimerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };


    const handleSendOtp = async () => {
        const fullNumber = `${countryCode}${phone}`;
        if (!fullNumber.startsWith('+')) {
            Toast.show({ type: 'error', text1: 'Invalid Format', text2: 'Please include country code' });
            return;
        }
        setSendOtpLoading(true);
        if (Platform.OS === 'android') {
            ToastAndroid.showWithGravity('Sending OTP...', ToastAndroid.LONG, ToastAndroid.BOTTOM)
        }
        try {
            const res = await signInWithPhoneNumber(getAuth(), fullNumber);
            console.log("SMS Sent", res);
            if (Platform.OS === 'android') {
                ToastAndroid.showWithGravity('OTP Sent.', ToastAndroid.LONG, ToastAndroid.BOTTOM)
            }
            setConfirmation(res);
            setShowOtpModal(true);
            startOtpTimer();
            Vibration.vibrate(100);
            setOtp('');
            focusField('otp');
        } catch (e) {
            console.log("SMS Error", e.message, typeof e);
            // const errorMsg = 
            if (__DEV__) {
                Toast.show({
                    type: 'error',
                    text1: 'SMS Error',
                    text2: e.message
                })
                return
            }
            Toast.show({
                type: 'error',
                text1: 'SMS Error',
                text2: 'An unknown error occured'
            })
        } finally {
            setSendOtpLoading(false)
        }
    }
    const handleOtpVerify = async () => {
        // 1. Local Validation
        if (!otp.trim() || otp.length !== 6) {
            setErrors({ otp: 'Please enter valid 6-digit OTP' });
            triggerShake('otp');
            Vibration.vibrate(50);
            return;
        }

        setErrors({});

        // 2. Dispatch Thunk
        try {
            // We use .unwrap() to catch the 'rejectWithValue' inside the try/catch block
            await dispatch(verifyOtpAndLogin({
                confirmation: confirmation,
                otp: otp
            })).unwrap();

            // 3. Success Logic
            Vibration.vibrate(100);
            setShowOtpModal(false);
            clearInterval(otpTimerRef.current);
            if (Platform.OS === 'android') {
                ToastAndroid.showWithGravity('OTP Verifying.', ToastAndroid.SHORT, ToastAndroid.BOTTOM)
            }

        } catch (e) {
            // 4. Error Logic (e is the 'message' from rejectWithValue)
            console.log("Verification Error:", e);
            setErrors({ otp: e || 'Invalid Otp' });
            triggerShake('otp');
            Vibration.vibrate(50);
            focusField('otp');
        }
    };

    const resendOtp = () => {
        if (otpTimer > 0) return;
        handleSendOtp();
        setOtp('');
        startOtpTimer();
        Vibration.vibrate(50);
    };

    return (
        <View style={[styles.container]}
        >
            <StatusBar barStyle={'light-content'} translucent backgroundColor={'transparent'} />

            <View style={[styles.subContainer, {
                paddingVertical: insets.top + Responsive.spacing[10],
                paddingHorizontal: Responsive.spacing[10]
            }]}>
                {/* <View style={styles.backBtnWrapper}>
                    <TouchableOpacity

                        onPress={() => navigation.goBack()}
                        style={styles.backBtn}>
                        <Feather name='arrow-left' color="#000" size={Responsive.fontSize[30]} />
                    </TouchableOpacity>
                </View> */}

                <View style={styles.imageWrapper}>
                    <Image source={require('../assets/images/BotLogin.png')}
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
                        paddingBottom: insets.bottom + Responsive.spacing[40]
                    }}
                    showsVerticalScrollIndicator={false}
                    bounces={true}
                >

                    <View style={styles.toggleWrapper}>
                        <TouchableOpacity
                            style={[styles.toggleBtn, loginType === 'email' && styles.toggleBtnActive]}
                            onPress={() => setLoginType('email')}
                        >
                            <Text style={[styles.toggleText, loginType === 'email' && styles.toggleTextActive]}>Email</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleBtn, loginType === 'phone' && styles.toggleBtnActive]}
                            onPress={() => setLoginType('phone')}
                        >
                            <Text style={[styles.toggleText, loginType === 'phone' && styles.toggleTextActive]}>Phone</Text>
                        </TouchableOpacity>
                    </View>

                    {loginType === 'email' ? (
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
                    ) : (
                        <View onLayout={(e) => { fieldPositions.current.phone = e.nativeEvent.layout.y; }} style={styles.inputWrapper}>
                            <Text style={styles.labelText}>Phone number</Text>
                            <View style={[styles.emailWrapperStyle, focusedField === 'phone' && styles.inputFocused, errors.phone && styles.inputError]}>
                                {/* <Feather name='phone' color={Colors.text.secondary} size={Responsive.fontSize[27]} /> */}
                                <Text style={styles.phoneCodeStyle}>+91</Text>
                                <TextInput
                                    ref={phoneInputRef}
                                    value={phone}
                                    placeholder='Enter your phone number'
                                    style={styles.inputView}
                                    keyboardType='phone-pad'
                                    onFocus={() => setFocusedField('phone')}
                                    onBlur={() => setFocusedField(null)}
                                    onChangeText={(text) => {
                                        setPhone(text);
                                        setErrors(prev => ({ ...prev, phone: null }));
                                    }}
                                    placeholderTextColor={Colors.text.secondary}
                                    maxLength={10}
                                />
                            </View>
                            {errors.phone && (
                                <Animated.View style={{ transform: [{ translateX: shakeAnim.phone || 0 }], marginLeft: Responsive.spacing[10] }}>
                                    <Text style={styles.errorText} accessibilityRole="alert" accessibilityLiveRegion="assertive">{errors.phone}</Text>
                                </Animated.View>
                            )}
                        </View>
                    )}
                    {loginType === 'email' && (
                        <View onLayout={(e) => { fieldPositions.current.password = e.nativeEvent.layout.y; }} style={styles.inputWrapper}>
                            <Text style={styles.labelText}>Password</Text>
                            <View style={[styles.emailWrapperStyle, focusedField === 'password' && styles.inputFocused, errors.password && styles.inputError]}>
                                <Feather name='lock' color={Colors.text.secondary} size={Responsive.fontSize[27]} />
                                <TextInput
                                    ref={passwordInputRef}
                                    value={password}
                                    placeholder='Enter your password'
                                    style={styles.inputView}
                                    secureTextEntry={!showPassword}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        setErrors(prev => ({ ...prev, password: null }));
                                    }}
                                    placeholderTextColor={Colors.text.secondary}
                                />
                                {password.length > 0 && (
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        onPress={() => setShowPassword(!showPassword)}
                                        style={styles.eyeIcon}
                                    >
                                        <Entypo name={showPassword ? 'eye' : 'eye-with-line'} color={Colors.text.secondary} size={Responsive.fontSize[20]} />
                                    </TouchableOpacity>
                                )}
                            </View>
                            {errors.password && (
                                <Animated.View style={{ transform: [{ translateX: shakeAnim.password || 0 }], marginLeft: Responsive.spacing[10] }}>
                                    <Text style={styles.errorText} accessibilityRole="alert" accessibilityLiveRegion="assertive">{errors.password}</Text>
                                </Animated.View>
                            )}
                        </View>
                    )}
                    {loginType === 'email' && (
                        <TouchableOpacity onPress={() => navigation.navigate('ForgotPasswordScreen')} style={styles.forgotPasswordStyle}>
                            <Text style={styles.forgotText}>Forgot Password?</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        disabled={isLoading}
                        activeOpacity={0.7}
                        onPress={handleLogin}
                        style={styles.loginBtn}>
                        {
                            isLoading ?
                                <>
                                    <ActivityIndicator size={Responsive.fontSize[22]} color={'#ccc'} />
                                    <Text style={styles.googleLoginBtnText}>Please wait....</Text>
                                </>
                                :

                                <Text style={styles.loginText}>{loginType === 'email' ? 'Login' : 'Send OTP'}</Text>
                        }
                    </TouchableOpacity>

                    <Text style={styles.orText}>Or</Text>
                    <TouchableOpacity
                        disabled={googleLoginLoading}
                        onPress={handleGoogleLogin}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel="Login with Google"
                        accessibilityHint="Logs in using your Google account"
                        style={styles.googleLoginBtn}>
                        {
                            googleLoginLoading ?
                                <>
                                    <ActivityIndicator size={Responsive.fontSize[28]} color={'#ccc'} />
                                    <Text style={styles.googleLoginBtnText}>Please wait....</Text>
                                </>

                                :
                                <>
                                    <Image
                                        source={require('../assets/images/googlepng.png')}
                                        resizeMode='contain'
                                        style={styles.googleImageStyle}
                                        accessibilityElementsHidden
                                        importantForAccessibility="no"
                                    />
                                    <Text style={styles.googleLoginBtnText}>Login with Google</Text>
                                </>

                        }
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('SignUpScreen')}>
                        <Text style={styles.dontHaveText}>Dont have an account? Create account</Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>

            {/* OTP Modal */}
            {showOtpModal && (
                <View style={styles.otpModalOverlay}>
                    <View style={styles.otpModalContent}>
                        <Text style={styles.otpTitle}>Enter OTP</Text>
                        <Text style={styles.otpSubtitle}>We've sent a 6-digit code to {phone}</Text>

                        <View style={styles.otpInputWrapper}>
                            <TextInput
                                ref={otpInputRef}
                                value={otp}
                                placeholder='Enter 6-digit OTP'
                                style={[styles.otpInput, errors.otp && styles.inputError]}
                                keyboardType='numeric'
                                maxLength={6}
                                onChangeText={(text) => {
                                    setOtp(text);
                                    setErrors(prev => ({ ...prev, otp: null }));
                                }}
                                placeholderTextColor={Colors.text.secondary}
                            />
                        </View>

                        {errors.otp && (
                            <Animated.View style={{ transform: [{ translateX: shakeAnim.otp || 0 }] }}>
                                <Text style={styles.errorText}>{errors.otp}</Text>
                            </Animated.View>
                        )}

                        <TouchableOpacity
                            disabled={otpVerifyLoading}
                            activeOpacity={0.7}
                            onPress={handleOtpVerify} style={styles.verifyBtn}>
                            {otpVerifyLoading ?
                                <>
                                    <ActivityIndicator size={Responsive.fontSize[22]} color={'#ccc'} />
                                    <Text style={styles.verifyText}>Please wait...</Text>
                                </>
                                : <Text style={styles.verifyText}>Verify OTP</Text>
                            }

                        </TouchableOpacity>

                        <View style={styles.resendWrapper}>
                            <TouchableOpacity onPress={resendOtp} disabled={otpTimer > 0}>
                                <Text style={[styles.resendText, otpTimer > 0 && styles.resendTextDisabled]}>
                                    {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend OTP'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity onPress={() => setShowOtpModal(false)} style={styles.cancelBtn}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    )
}

export default LoginScreen

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
    emailWrapperStyle: {
        padding: Responsive.padding[8],
        backgroundColor: Colors.surface,
        borderRadius: Responsive.radius[20],
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Responsive.spacing[20],
        gap: Responsive.spacing[5],
        borderWidth: 0.5,
        borderColor: Colors.border.default
    },
    phoneCodeStyle: {
        fontSize: Responsive.fontSize[16],
        borderWidth: 0,
        padding: 3,
        color: Colors.text.secondary,
        borderRightWidth: 1,
        borderRightColor: Colors.text.secondary,

    },
    labelText: {
        color: Colors.text.secondary,
        fontSize: Responsive.fontSize[16],
        fontWeight: '400',
        letterSpacing: 0.5,
    },
    inputView: {
        color: Colors.text.secondary,
        fontSize: Responsive.fontSize[16],
        flex: 1
    },
    forgotPasswordStyle: {
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        marginBottom: Responsive.spacing[10]
    },
    forgotText: {
        color: Colors.text.secondary,
        fontSize: Responsive.fontSize[14]
    },
    loginBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        // paddingVertical: Responsive.padding[10],
        backgroundColor: Colors.primary,
        borderRadius: Responsive.radius[16],
        width: '100%',
        height: Responsive.size.hp(7),

        shadowColor: Colors.shadow,
        shadowOpacity: 0.4,
        shadowRadius: Responsive.radius[6],
        shadowOffset: { width: 0, height: 4 },
        borderWidth: 0.5,
        borderColor: Colors.border.default,

        gap: Responsive.spacing[15]
    },
    loginText: {
        color: Colors.text.primary,
        fontWeight: '700',
        letterSpacing: 1,
        fontSize: Responsive.fontSize[16]
    },
    orText: {
        textAlign: 'center',
        paddingVertical: Responsive.padding[5],
        marginVertical: Responsive.spacing[5],
        fontSize: Responsive.fontSize[16],
        color: Colors.text.secondary,
    },
    googleImageStyle: {
        width: Responsive.size.wp(7),
        height: Responsive.size.hp(7)
    },
    googleLoginBtn: {
        backgroundColor: Colors.surface,
        borderRadius: Responsive.radius[16],
        width: '100%',
        height: Responsive.size.hp(7),
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.shadow,
        shadowOpacity: 0.4,
        shadowRadius: Responsive.radius[6],
        shadowOffset: { width: 0, height: 4 },
        borderWidth: 0.5,
        borderColor: Colors.border.default,
        flexDirection: 'row',
        gap: Responsive.spacing[15]

    },
    googleLoginBtnText: {
        color: Colors.text.primary,
        fontSize: Responsive.fontSize[15],
        fontWeight: '500',
    },
    dontHaveText: {
        fontSize: Responsive.fontSize[13],
        textDecorationLine: 'underline',
        textAlign: 'center',
        paddingTop: Responsive.padding[10],
        color: Colors.text.secondary,
    },
    loginImageStyle: {
        width: Responsive.size.wp(62),
        height: Responsive.size.hp(25)
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
        // marginTop: Responsive.spacing[5]
    },
    eyeIcon: {
        padding: Responsive.padding[5]
    },
    toggleWrapper: {
        flexDirection: 'row',
        backgroundColor: Colors.background,
        borderRadius: Responsive.radius[25],
        padding: Responsive.padding[4],
        marginBottom: Responsive.spacing[20],
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: Responsive.padding[12],
        borderRadius: Responsive.radius[20],
        alignItems: 'center',

    },
    toggleBtnActive: {
        backgroundColor: Colors.surface,
        elevation: 5,
        shadowColor: Colors.text.primary,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        borderWidth: 0.5,
        borderColor: Colors.text.primary,
    },
    toggleText: {
        fontSize: Responsive.fontSize[16],
        fontWeight: '500',
        color: Colors.text.secondary,
    },
    toggleTextActive: {
        color: Colors.primary,
        fontWeight: '600',
    },
    otpModalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: Colors.overlay,
        justifyContent: 'center',
        alignItems: 'center',

    },
    otpModalContent: {
        backgroundColor: Colors.surface,
        borderRadius: Responsive.radius[20],
        padding: Responsive.padding[30],
        width: '85%',
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: Colors.border.default
    },
    otpTitle: {
        fontSize: Responsive.fontSize[24],
        fontWeight: 'bold',
        color: Colors.text.primary,
        marginBottom: Responsive.spacing[10],
    },
    otpSubtitle: {
        fontSize: Responsive.fontSize[16],
        color: Colors.text.secondary,
        textAlign: 'center',
        marginBottom: Responsive.spacing[25],
    },
    otpInputWrapper: {
        width: '100%',
        marginBottom: Responsive.spacing[20],


    },
    otpInput: {
        backgroundColor: Colors.surface,
        borderRadius: Responsive.radius[15],
        padding: Responsive.padding[15],
        fontSize: Responsive.fontSize[18],
        textAlign: 'center',
        letterSpacing: 2,
        color: Colors.text.primary,
        borderWidth: 0.5,
        borderColor: Colors.border.default
    },
    verifyBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.accent,
        borderRadius: Responsive.radius[15],
        paddingVertical: Responsive.padding[15],
        paddingHorizontal: Responsive.padding[30],
        width: '100%',
        marginVertical: Responsive.spacing[15],
        gap: Responsive.spacing[10],
    },
    verifyText: {
        fontSize: Responsive.fontSize[16],
        fontWeight: 'bold',
        color: Colors.text.primary,
    },
    resendWrapper: {
        marginBottom: Responsive.spacing[15],
    },
    resendText: {
        fontSize: Responsive.fontSize[16],
        color: Colors.primary,
        fontWeight: '600',
    },
    resendTextDisabled: {
        color: Colors.text.disabled,
    },
    cancelBtn: {
        paddingVertical: Responsive.padding[10],
    },
    cancelText: {
        fontSize: Responsive.fontSize[16],
        color: Colors.text.secondary,
    }
})