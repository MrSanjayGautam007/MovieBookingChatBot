import { ActivityIndicator, Animated, Image, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, Vibration, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import { Responsive } from '../utilities/Responsive';
import { Colors } from '../utilities/AppTheme';
import { useDispatch, useSelector } from 'react-redux';
import { signupWithEmail } from '../redux/slice/authSlice';
const SignUpScreen = () => {
  const { signUpLoading } = useSelector((state) => state.auth)
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const fieldPositions = useRef({});
  const scrollRef = useRef(null);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const [errors, setErrors] = useState({});
  const timerRef = useRef(null)
  const confirmPasswordInputRef = useRef(null)
  const [showPassword, setShowPassword] = useState(false)
  const [confirmShowPassword, setConfirmShowPassword] = useState(false)
  // const [fullName, setFullName] = useState('');
  const dispatch = useDispatch();
  const keyboardHeight = useRef(0);
  const focusableFields = {
    email: emailInputRef,
    password: passwordInputRef,
    confirmPassword: confirmPasswordInputRef,
  };

  const focusField = (key) => {
    const ref = focusableFields[key];
    if (!ref) return;
    setTimeout(() => {
      ref.current?.focus();
    }, 300);
  };
  // const scrollToInput = (ref) => {
  //   setTimeout(() => {
  //     ref?.current?.measureLayout(
  //       scrollRef.current,
  //       (x, y) => {
  //         scrollRef.current?.scrollTo({ y: Math.max(0, y - 80), animated: true });
  //       },
  //       () => { }
  //     );
  //   }, 100);
  // };

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
    password: new Animated.Value(0),
    confirmPassword: new Animated.Value(0),
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
  const handleSignUp = () => {
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
    if (!password.trim()) {
      newErrors.password = 'Password is required';
      Vibration.vibrate(50);
    }
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirm password is required';
      Vibration.vibrate(50);
    } else if (confirmPassword.trim() !== password.trim()) {
      newErrors.confirmPassword = 'Password mismatched'
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
    // setLoadings(true)
    // timerRef.current = setTimeout(() => {
    //     navigation.replace('Home');
    //     setLoadings(false)
    // }, 2000);
    dispatch(signupWithEmail({ email: email.trim(), password: password.trim() }))
    return () => { clearInterval(timerRef.current), Vibration.vibrate(50) };
  }
  return (
    <View style={styles.container}>
      <StatusBar barStyle={'light-content'} translucent backgroundColor={'transparent'} />

      <View style={[styles.subContainer, {
        paddingVertical: insets.top + Responsive.spacing[10],
        paddingHorizontal: Responsive.spacing[10]
      }]}>
        <View style={styles.backBtnWrapper}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}>
            <Feather name='arrow-left' color="#fff" size={Responsive.fontSize[30]} />
          </TouchableOpacity>
        </View>

        <View style={styles.imageWrapper}>
          <Image source={require('../assets/images/Login.png')}
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
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingVertical: Responsive.padding[20],
            paddingHorizontal: Responsive.padding[30],
            paddingBottom: insets.bottom + Responsive.spacing[40]
          }}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* <Text style={styles.labelText}>Full Name</Text>
          <View style={styles.emailWrapperStyle}>
            <Feather name='user' color="gray" size={Responsive.fontSize[27]} />
            <TextInput
              value={fullName}
              placeholder='Enter your full name'
              style={styles.inputView}
              onChangeText={setFullName}
              placeholderTextColor={'gray'}
            />
          </View> */}
          {/* Email Input */}
          <View onLayout={(e) => { fieldPositions.current.email = e.nativeEvent.layout.y; }} style={styles.inputWrapper}>
            <Text style={styles.labelText}>Email address</Text>
            <View style={[styles.emailWrapperStyle, focusedField === 'email' && styles.inputFocused,
            errors.email && styles.inputError]}>
              <Feather name='mail' color="gray" size={Responsive.fontSize[27]} />
              <TextInput
                ref={emailInputRef}
                value={email}
                placeholder='Enter your email'
                style={styles.inputView}
                keyboardType='email-address'
                onFocus={() => {
                  setFocusedField('email');
                  // scrollToInput(emailInputRef);                                                                                     
                }}
                onBlur={() => setFocusedField(null)}
                onChangeText={(text) => {
                  setEmail(text)
                  setErrors(prev => ({ ...prev, email: null }));
                }}
                placeholderTextColor={'gray'}
              />
            </View>
            {errors.email && (
              <Animated.View style={{ transform: [{ translateX: shakeAnim.email || 0 }], marginLeft: Responsive.spacing[10] }}>
                <Text style={styles.errorText} accessibilityRole="alert"
                  accessibilityLiveRegion="assertive">{errors.email}</Text>
              </Animated.View>
            )}
          </View>
          {/* Password Input */}
          <View onLayout={(e) => { fieldPositions.current.password = e.nativeEvent.layout.y; }} style={styles.inputWrapper}>
            <Text style={styles.labelText}>Password</Text>
            <View style={[styles.emailWrapperStyle,
            focusedField === 'password' && styles.inputFocused,
            errors.password && styles.inputError
            ]}>
              <Feather name='lock' color="gray" size={Responsive.fontSize[27]} />
              <TextInput
                ref={passwordInputRef}
                value={password}
                placeholder='Enter your password'
                style={styles.inputView}

                secureTextEntry={!showPassword}
                // onFocus={() => setFocusedField('password')}
                onFocus={() => {
                  setFocusedField('password');
                  // scrollToInput(passwordInputRef);
                }}
                onBlur={() => setFocusedField(null)}
                onChangeText={(text) => {
                  setPassword(text)
                  setErrors(prev => ({ ...prev, password: null }));
                }}
                placeholderTextColor={'gray'}
              />
              {
                password.length > 0 && <TouchableOpacity
                  activeOpacity={0.7}
                  onPressIn={() => setShowPassword(!showPassword)}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  accessibilityHint="Toggles password visibility"
                >
                  {
                    !confirmShowPassword ?
                      <Entypo name={'eye'} size={Responsive.fontSize[24]} color={focusedField === 'confirmPassword' ? '#b9a1a1' : '#aca6a6'} /> :
                      <Entypo name={'eye-with-line'} size={Responsive.fontSize[24]} color={focusedField === 'onfirmPassword' ? '#b9a1a1' : '#aca6a6'} />
                  }

                </TouchableOpacity>
              }
            </View>
            {errors.password && (
              <Animated.View style={{ transform: [{ translateX: shakeAnim.password || 0 }], marginLeft: Responsive.spacing[10] }}>
                <Text style={styles.errorText} accessibilityRole="alert"
                  accessibilityLiveRegion="assertive">{errors.password}</Text>
              </Animated.View>
            )}
          </View>
          <View onLayout={(e) => { fieldPositions.current.confirmPassword = e.nativeEvent.layout.y; }} style={styles.inputWrapper}>
            <Text style={styles.labelText}>Confirm Password</Text>
            <View style={[styles.emailWrapperStyle, focusedField === 'confirmPassword' && styles.inputFocused,
            errors.confirmPassword && styles.inputError]}>
              <Feather name='lock' color="gray" size={Responsive.fontSize[27]} />
              <TextInput
                ref={confirmPasswordInputRef}
                value={confirmPassword}
                placeholder='Confirm your password'
                style={styles.inputView}
                secureTextEntry={!confirmShowPassword}
                onFocus={() => {
                  setFocusedField('confirmPassword');
                  // scrollToInput(confirmPasswordInputRef);
                }}
                onBlur={() => setFocusedField(null)}
                onChangeText={(text) => {
                  setConfirmPassword(text)
                  setErrors(prev => ({ ...prev, confirmPassword: null }));
                }}
                placeholderTextColor={'gray'}
              />
              {
                confirmPassword.length > 0 && <TouchableOpacity
                  activeOpacity={0.7}
                  onPressIn={() => setConfirmShowPassword(!confirmShowPassword)}
                  accessibilityRole="button"
                  accessibilityLabel={confirmShowPassword ? 'Hide password' : 'Show password'}
                  accessibilityHint="Toggles password visibility"
                >
                  {
                    !confirmShowPassword ?
                      <Entypo name={'eye'} size={Responsive.fontSize[24]} color={focusedField === 'confirmPassword' ? '#b9a1a1' : '#aca6a6'} /> :
                      <Entypo name={'eye-with-line'} size={Responsive.fontSize[24]} color={focusedField === 'onfirmPassword' ? '#b9a1a1' : '#aca6a6'} />
                  }

                </TouchableOpacity>
              }
            </View>
            {errors.confirmPassword && (
              <Animated.View style={{ transform: [{ translateX: shakeAnim.confirmPassword || 0 }], marginLeft: Responsive.spacing[10] }}>
                <Text style={styles.errorText} accessibilityRole="alert"
                  accessibilityLiveRegion="assertive">{errors.confirmPassword}</Text>
              </Animated.View>
            )}
          </View>
          <TouchableOpacity
          activeOpacity={0.7}
            disabled={signUpLoading}
            onPress={handleSignUp}
            style={styles.loginBtn}>
            {
              signUpLoading ?
                <>
                  <ActivityIndicator size={Responsive.fontSize[22]} color={'#ccc'} />
                  <Text style={styles.googleLoginBtnText}>Please wait....</Text>
                </>
                :

                <Text style={styles.loginText}>Sign Up</Text>
            }

          </TouchableOpacity>

          <Text style={styles.orText}>Or</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Sign up with Google"
            accessibilityHint="Signs up using your Google account"
            style={styles.googleLoginBtn}>
            <Image
              source={require('../assets/images/googlepng.png')}
              resizeMode='contain'
              style={styles.googleImageStyle}
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
            <Text style={styles.googleLoginBtnText}>Sign up with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
            <Text style={styles.dontHaveText}>Already have an account? Login</Text>
          </TouchableOpacity>

          {/* Terms and Privacy */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>By signing up, you agree to our </Text>
            <TouchableOpacity onPress={() => navigation.navigate('TermsConditions' as never)}>
              <Text style={styles.termsLink}>Terms & Conditions</Text>
            </TouchableOpacity>
            <Text style={styles.termsText}> and </Text>
            <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy' as never)}>
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

export default SignUpScreen

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
  inputWrapper: {
    marginBottom: Responsive.spacing[6],
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

    // paddingVertical: Responsive.padding[15],
    backgroundColor: Colors.accent,
    borderRadius: Responsive.radius[16],
    marginTop: Responsive.spacing[10],
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
  inputFocused: {
    borderColor: Colors.border.focused,
    borderWidth: 1,
    backgroundColor: '#2F5755',
  },
  inputError: {
    borderColor: Colors.status.error,
    borderWidth: 1,
  },
  errorText: {
    color: Colors.status.error,
    fontSize: Responsive.fontSize[12],
    marginTop: -Responsive.spacing[4],
    marginBottom: Responsive.spacing[8],
  },
  termsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Responsive.spacing[15],
    paddingHorizontal: Responsive.padding[10],
  },
  termsText: {
    fontSize: Responsive.fontSize[11],
    color: Colors.text.secondary,
  },
  termsLink: {
    fontSize: Responsive.fontSize[11],
    color: Colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
})
