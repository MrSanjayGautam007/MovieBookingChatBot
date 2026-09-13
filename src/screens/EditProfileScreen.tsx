import React, { useCallback, useRef, useState } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, ScrollView, TextInput, Image, Platform, KeyboardAvoidingView, BackHandler, Keyboard, ActivityIndicator, Animated, Vibration } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Feather from 'react-native-vector-icons/Feather'
import { Responsive } from '../utilities/Responsive'
import { Colors } from '../utilities/AppTheme'
import Icon from 'react-native-vector-icons/MaterialIcons';
import GradientBackground from '../components/GradientBackground'
import { useDispatch, useSelector } from 'react-redux';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { pickImageFromCamera, pickImageFromGallery } from '../utilities/imageCropPicker'
import { deleteProfilePhoto, updateProfilePhoto, updateUserProfile } from '../redux/slice/userProfileSlice'
import { logger } from '../utilities/logger'

// import { KeyboardAvoidingView } from 'react-native-keyboard-controller'
const EditProfileScreen = () => {
  const { profile, updateLoading, profilePicLoading, uploadProgress, profilePicDeleteLoading } = useSelector((state) => state.user);
  // logger.log('Profile', profile);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user } = useSelector((state) => state.auth)
  const [name, setName] = useState(user?.displayName || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [localPhoto, setLocalPhoto] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  const sheet = useRef<TrueSheet>(null)
  const fieldPositions = useRef({});
  const scrollRef = useRef(null);
  const emailInputRef = useRef(null);
  const nameInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const isSheetOpen = useRef(false);
  const present = () => {
    Keyboard.dismiss();

    requestAnimationFrame(async () => {
      isSheetOpen.current = true;

      await sheet.current?.present();
    });
  };

  const dismiss = async () => {
    if (!isSheetOpen.current) return;

    isSheetOpen.current = false;
    await sheet.current?.dismiss();
  };

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return;

      const onBackPress = () => {
        // If sheet is open → dismiss it
        if (isSheetOpen.current) {
          dismiss();
          return true; // stop navigation
        }

        // Otherwise → allow normal navigation behavior
        return false;
      };

      const sub = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      return () => sub.remove();
    }, [])
  );

  const focusableFields = {
    email: emailInputRef,
    name: nameInputRef,
    phone: phoneInputRef,
  };
  const isOnlyDigits = (value) => /^\d+$/.test(value);
  const isValidPhone = (value) => isOnlyDigits(value) && value.length >= 10;
  const focusField = (key) => {
    const ref = focusableFields[key];
    if (!ref) return;
    setTimeout(() => { ref.current?.focus(); }, 300);
  };
  const handleSave = () => {
    // Save logic here
    navigation.goBack()
  }
  const handleGalleryPick = async () => {
    try {
      const image = await pickImageFromGallery();
      if (!image) return;

      // 1. Set local preview instantly
      setLocalPhoto(image.path);

      // 2. Upload and wait for completion
      await dispatch(updateProfilePhoto({
        uid: user.uid,
        image,
      })).unwrap();


      setLocalPhoto(null);
    } catch (error) {
      setLocalPhoto(null); // Reset on error
      logger.error("Gallery Upload Error:", error);
    }
  };

  const handleCameraPick = async () => {
    try {
      const image = await pickImageFromCamera();
      if (!image) return;

      // 1. Set local preview instantly
      setLocalPhoto(image.path);

      // 2. Upload
      await dispatch(updateProfilePhoto({
        uid: user.uid,
        image,
      })).unwrap();

      // 3. Success!
      setLocalPhoto(null);
    } catch (error) {
      setLocalPhoto(null);
      logger.error("Camera Upload Error:", error);
    }
  };

  const handleRemovePic = async () => {
    try {
      await dispatch(deleteProfilePhoto({ uid: user.uid })).unwrap();
      // Clear everything to show placeholder
      setLocalPhoto(null);
    } catch (error) {
      logger.error("Remove Error:", error);
    }
  };
  const handleUpdate = () => {
    // logger.log('Updated pressed');

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
    if (!name.trim()) {
      newErrors.name = 'Name is required';
      Vibration.vibrate(50);
    }
    if (!phone) {
      newErrors.phone = 'Phone number is required';
      Vibration.vibrate(50);
    } else if (!isValidPhone(phone)) {
      newErrors.phone = 'Contact number must be at least 10 digits';
      Vibration.vibrate(50);
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
    dispatch(
      updateUserProfile({
        uid: user?.uid,
        name,
        phone,

      })
    );
  };
  const scrollToField = (key) => {
    const y = fieldPositions.current[key];
    if (y !== undefined) {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 20), animated: true });
    }
  };

  const shakeAnim = useRef({
    name: new Animated.Value(0),
    email: new Animated.Value(0),
    phone: new Animated.Value(0),
  }).current;

  const triggerShake = (key) => {
    const anim = shakeAnim[key];
    if (!anim) return;
    Animated.sequence([
      Animated.timing(anim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(anim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };
  return (
    <GradientBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Responsive.spacing[15] }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={Responsive.fontSize[24]} color={Colors.text.inverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        {/* <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          onPress={handleUpdate}
          activeOpacity={0.8}
          style={{
            opacity: updateLoading ? 0.7 : 1,
            width: Responsive.spacing[40],

          }}
          disabled={updateLoading}
          accessibilityRole="button"
          accessibilityLabel="Save changes"
          accessibilityHint="Updates your profile information"
        >
          {updateLoading ? (
            <ActivityIndicator size="small" color="#fff" />

          ) : (
            <Text style={styles.saveButton}>Save</Text>
          )}
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => {
            Keyboard.dismiss();
          }}
          // style={styles.content}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Responsive.spacing[10] }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {
                user?.photoURL ?
                  (
                    <Image
                      source={{ uri: user?.photoURL }}
                      style={{
                        width: Responsive.size.wp(20),
                        height: Responsive.size.wp(20),
                        borderRadius: Responsive.size.wp(10),
                      }}
                    />
                  ) :
                  <MaterialIcons name="account-circle" size={Responsive.fontSize[80]} color={Colors.primary} />
              }
            </View>
            <TouchableOpacity
              onPress={present}
              style={styles.changePhotoButton}>
              <MaterialIcons name="camera-alt" size={Responsive.fontSize[20]} color={Colors.text.primary} />
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View onLayout={(e) => { fieldPositions.current.name = e.nativeEvent.layout.y; }} >
                <View style={[styles.inputWrapper,
                focusedField === 'name' && styles.inputFocused,
                errors.name && styles.inputError
                ]}>
                  <MaterialIcons name="person" size={Responsive.fontSize[20]} color={Colors.text.secondary} />
                  <TextInput
                    style={styles.input}
                    value={name}
                    placeholder="Enter your name"
                    placeholderTextColor={Colors.text.disabled}
                    ref={nameInputRef}
                    onFocus={() => {
                      setFocusedField('name');
                    }}
                    onBlur={() => setFocusedField(null)}
                    onChangeText={(text) => {
                      setName(text);
                      setErrors(prev => ({ ...prev, name: null }));
                    }}

                    onSubmitEditing={() => emailInputRef.current?.focus()}

                    accessibilityLabel="Full name"
                    accessibilityHint="Enter your full name"
                  />
                </View>
                {errors.name && (
                  <Animated.View style={{ transform: [{ translateX: shakeAnim.name || 0 }] }}>
                    <Text style={styles.errorText} accessibilityLiveRegion="polite">{errors.name}</Text>
                  </Animated.View>
                )}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View onLayout={(e) => { fieldPositions.current.email = e.nativeEvent.layout.y; }} >
                <View style={[styles.inputWrapper,
                focusedField === 'email' && styles.inputFocused,
                errors.phone && styles.inputError
                ]}>
                  <MaterialIcons name="email" size={Responsive.fontSize[20]} color={Colors.text.secondary} />
                  <TextInput
                    ref={emailInputRef}
                    value={email}
                    onFocus={() => {
                      setFocusedField('email');

                    }}
                    style={styles.input}
                    onBlur={() => setFocusedField(null)}
                    onChangeText={(text) => {
                      setEmail(text);
                      setErrors(prev => ({ ...prev, email: null }));
                    }}
                    keyboardType='email-address'
                    placeholder='Enter your email'
                    returnKeyType="next"
                    onSubmitEditing={() => phoneInputRef.current?.focus()}
                    blurOnSubmit={false}
                    editable={false}
                    placeholderTextColor={Colors.text.disabled}

                  />
                </View>
                {errors.email && (
                  <Animated.View style={{ transform: [{ translateX: shakeAnim.email || 0 }] }}>
                    <Text style={styles.errorText} accessibilityLiveRegion="polite">{errors.email}</Text>
                  </Animated.View>
                )}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View onLayout={(e) => { fieldPositions.current.phone = e.nativeEvent.layout.y; }} >
                <View style={[styles.inputWrapper,
                focusedField === 'phone' && styles.inputFocused,
                errors.phone && styles.inputError
                ]}>
                  <MaterialIcons name="phone" size={Responsive.fontSize[20]} color={Colors.text.secondary} />
                  <TextInput
                    style={styles.input}
                    ref={phoneInputRef}
                    value={phone}
                    onChangeText={(text) => {
                      setPhone(text);
                      setErrors(prev => ({ ...prev, phone: null }));
                    }}
                    placeholder='Enter your phone number'
                    returnKeyType="done"
                    onBlur={() => setFocusedField(null)}
                    keyboardType='phone-pad'
                    maxLength={10}
                    onFocus={() => {
                      setFocusedField('phone');

                    }}
                    accessibilityLabel="Phone number"
                    accessibilityHint="Enter your 10 digit phone number"

                  />
                </View>
                {errors.phone && (
                  <Animated.View style={{ transform: [{ translateX: shakeAnim.email || 0 }] }}>
                    <Text style={styles.errorText} accessibilityLiveRegion="polite">{errors.phone}</Text>
                  </Animated.View>
                )}
              </View>
            </View>
          </View>

          <View style={{ height: insets.bottom + Responsive.spacing[20] }} />
        </ScrollView>
      </KeyboardAvoidingView>
      <TrueSheet
        ref={sheet}
        detents={['auto']}
        backgroundBlur="dark"
        // draggable={false}
        blurOptions={{
          intensity: 15,
          interaction: false,
        }}
        backgroundColor={Colors.background}
        cornerRadius={Responsive.radius[24]}
        accessibilityViewIsModal={true}
      >
        <View style={styles.trueSheetContainer}>
          {/* <View style={styles.grabber} />  */}
          <Text style={styles.title}>Choose Options</Text>
          <View style={styles.optionView}>
            <TouchableOpacity
              style={styles.option}
              onPress={() => {
                dismiss();
                handleCameraPick();
              }}
              accessibilityRole="button"
              accessibilityLabel="Take photo"
            >
              <Icon name="photo-camera" size={Responsive.fontSize[20]} color="#007AFF" />
              <Text style={styles.optionText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              onPress={() => {
                dismiss();
                handleGalleryPick();
              }}
              accessibilityRole="button"
              accessibilityLabel="Choose from gallery"
            >
              <Icon name="photo-library" size={Responsive.fontSize[20]} color="#007AFF" />
              <Text style={styles.optionText}>Choose from Gallery</Text>
            </TouchableOpacity>



            <TouchableOpacity
              style={styles.option}
              onPress={() => {
                dismiss();
                handleRemovePic()
              }}
              accessibilityRole="button"
              accessibilityLabel="Remove profile photo"
            >
              <Icon name="delete" size={Responsive.fontSize[20]} color="#ff4444" />
              <Text style={styles.optionText}>Remove Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.option}
              onPress={() => {
                dismiss();
              }}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <Icon name="close" size={Responsive.fontSize[20]} color="#666" />
              <Text style={styles.optionText}>Cancel</Text>
            </TouchableOpacity>
          </View>

        </View>
      </TrueSheet>
    </GradientBackground>
  )
}

export default EditProfileScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Responsive.spacing[20],
    paddingBottom: Responsive.spacing[15],
    backgroundColor: Colors.primary,
  },
  backButton: {
    width: Responsive.spacing[40],
  },
  headerTitle: {
    fontSize: Responsive.fontSize[20],
    fontWeight: 'bold',
    color: Colors.text.inverse,
  },
  saveButton: {
    fontSize: Responsive.fontSize[16],
    fontWeight: '600',
    color: Colors.text.inverse,
  },
  // content: {
  //   flex: 1,
  // },
  scrollContent: {
    flexGrow: 1,
    padding: Responsive.size.wp(5),
    paddingBottom: Responsive.spacing[40],
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: Responsive.padding[30],
  },
  avatarContainer: {
    marginBottom: Responsive.spacing[15],
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Responsive.padding[20],
    paddingVertical: Responsive.padding[10],
    borderRadius: Responsive.radius[20],
    backgroundColor: `${Colors.primary}15`,
  },
  changePhotoText: {
    fontSize: Responsive.fontSize[14],
    color: Colors.text.primary,
    fontWeight: '600',
    marginLeft: Responsive.spacing[8],
  },
  form: {
    paddingHorizontal: Responsive.spacing[20],
  },
  inputGroup: {
    marginBottom: Responsive.spacing[20],
  },
  label: {
    fontSize: Responsive.fontSize[14],
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Responsive.spacing[8],
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Responsive.radius[12],
    paddingHorizontal: Responsive.padding[15],
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  inputFocused: {
    borderColor: '#b9a1a1',
    backgroundColor: Colors.background,
  },

  inputError: {
    borderColor: '#f56565',
  },
  input: {
    flex: 1,
    fontSize: Responsive.fontSize[16],
    color: Colors.text.primary,
    paddingVertical: Responsive.padding[12],
    paddingLeft: Responsive.padding[12],
  },
  // True Sheet Styles
  trueSheetContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: Responsive.spacing[24],
    paddingTop: Responsive.spacing[16],
    paddingBottom: Responsive.spacing[40],
    borderTopLeftRadius: Responsive.radius[28],
    borderTopRightRadius: Responsive.radius[28],
  },
  grabber: {
    width: Responsive.size.wp(12),
    height: Responsive.size.hp(0.5),
    backgroundColor: '#CBD5E0',
    borderRadius: Responsive.radius[8],
    alignSelf: 'center',
    marginBottom: Responsive.spacing[20],
  },
  title: {
    fontSize: Responsive.fontSize[20],
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: Responsive.spacing[24],
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  option: {
    paddingVertical: Responsive.spacing[10],
    paddingHorizontal: Responsive.spacing[20],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Responsive.radius[16],
    marginBottom: Responsive.spacing[12],
    gap: Responsive.spacing[16],
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: Colors.text.primary,
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  optionText: {
    fontSize: Responsive.fontSize[17],
    fontWeight: '600',
    color: Colors.text.primary,
    letterSpacing: 0.3,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: Responsive.spacing[20],
    marginHorizontal: Responsive.spacing[8],
  },
  cancelButton: {
    fontSize: Responsive.fontSize[16],
    fontWeight: '500',
    color: '#4a5568',
    textAlign: 'center',
    paddingVertical: Responsive.spacing[12],
  },
  optionView: {
    paddingHorizontal: Responsive.spacing[4],
    paddingVertical: Responsive.spacing[8],
  },
  profileLoadingView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    width: '100%',
    height: '100%',

  },
  profileLoadingText: {
    fontSize: Responsive.fontSize[13],
    fontWeight: '500',
    color: '#4a5568',
    marginLeft: Responsive.spacing[12],
  },

  errorText: {
    color: '#f56565',
    fontSize: Responsive.fontSize[12],
    marginTop: Responsive.spacing[3],
    fontWeight: '500',
  },
})
