import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getApp } from '@react-native-firebase/app';
import auth, {
    GoogleAuthProvider,
    signInWithCredential,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    reauthenticateWithCredential,
    deleteUser,
    EmailAuthProvider
} from '@react-native-firebase/auth';
import firestore, {
    writeBatch, // Use this instead of firestore().batch()
    getDoc,
    getDocs,
    collection,
    doc,
    getFirestore
} from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Toast from 'react-native-toast-message';
import { FIREBASE_WEB_CLIENT_ID } from '@env';
import { createUserProfile, updateUserProfile } from './userProfileSlice';
const getAuth = () => auth(getApp());

// console.log(FIREBASE_WEB_CLIENT_ID);

GoogleSignin.configure({
    webClientId: FIREBASE_WEB_CLIENT_ID,
    offlineAccess: true,
});
// Helper to sanitize user object for Redux
const serializeUser = (user) => {
    if (!user) return null;
    const providers = user.providerData.map(p => p.providerId);
    return {
        uid: user.uid,
        email: user.email,
        phoneNumber: user.phoneNumber,
        displayName: user.displayName,
        photoURL: user.photoURL,

        // 2. Keep the primary provider for logic...
        providerId: user.providerData[0]?.providerId || 'password',

        // 3. ...but add the full list for the UI
        linkedProviders: providers,

        // 4. Helpful flags for your UI components
        isPhoneLinked: providers.includes('phone'),
        isGoogleLinked: providers.includes('google.com'),
    };
};
const getReadableErrorMessage = (errorCode) => {
    switch (errorCode) {
        case 'auth/invalid-email':
            return 'The email address is not valid.';
        case 'auth/user-disabled':
            return 'This user account has been disabled.';
        case 'auth/user-not-found':
            return 'No user found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password. Please try again.';
        case 'auth/email-already-in-use':
            return 'This email is already registered.';
        case 'auth/weak-password':
            return 'Password is too weak. Use at least 6 characters.';
        case 'auth/invalid-credential':
            return 'Invalid credentials. Please check your login details.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your internet connection.';
        case 'auth/invalid-verification-code':
            return 'Invalid verification code.';
        case 'auth/code-expired':
            return 'The code has expired. Please request a new one.';
        default:
            return 'An unexpected error occurred. Please try again.';
    }
};

export const loginWithEmail = createAsyncThunk(
    'auth/loginWithEmail',
    async ({ email, password }, thunkAPI) => {
        try {
            // Pass the explicit auth instance
            const userCredential = await signInWithEmailAndPassword(
                getAuth(),
                email,
                password
            );
            // Toast.show({ type: 'success', text1: 'Success', text2: 'Logged in successfully!' });
            return serializeUser(userCredential.user);
        } catch (error) {
            const message = getReadableErrorMessage(error.code);
            Toast.show({ type: 'error', text1: 'Login Failed', text2: message });
            return thunkAPI.rejectWithValue(message);
        }
    }
);
export const phoneAuthService = {
    sendSMS: async (phoneNumber) => {
        try {
            // Modular syntax: function(authInstance, data)
            const confirmation = await signInWithPhoneNumber(getAuth(), phoneNumber);
            return { confirmation, error: null };
        } catch (error) {
            return { confirmation: null, error: error.message };
        }
    }
};
export const loginWithGoogle = createAsyncThunk(
    'auth/loginWithGoogle',
    async (_, thunkAPI) => {
        // console.log('GoogleLogin');

        try {
            await GoogleSignin.hasPlayServices();

            // 1. New way to get the response
            const response = await GoogleSignin.signIn();

            // 2. Safely extract idToken (v10.x+ uses response.data)
            const idToken = response.data?.idToken || response.idToken;

            if (!idToken) {
                return thunkAPI.rejectWithValue('Google Sign-In failed: No ID Token found');
            }

            // 3. Create credential
            const googleCredential = GoogleAuthProvider.credential(idToken);

            // 4. Sign in to Firebase
            const userCredential = await signInWithCredential(
                getAuth(),
                googleCredential
            );

            // Toast.show({ type: 'success', text1: 'Success', text2: 'Signed in!' });


            return serializeUser(userCredential.user);

        } catch (error) {
            // Log exactly what the error is before trying to access .code
            console.log("ACTUAL ERROR:", error);

            const errorCode = error?.code || 'unknown';
            const message = getReadableErrorMessage(errorCode);

            Toast.show({
                type: 'error',
                text1: 'Sign-In Error',
                text2: message
            });
            return thunkAPI.rejectWithValue(message);
        }
    }
);
export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, thunkAPI) => {
        try {
            await signOut(getAuth());
            await GoogleSignin.signOut();
            Toast.show({ type: 'info', text1: 'Logged Out', text2: 'See you soon!' });
            return null;
        } catch (error) {
            // console.log('Logout error', error);

            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const signupWithEmail = createAsyncThunk(
    'auth/signupWithEmail',
    async ({ email, password }, thunkAPI) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(
                getAuth(),
                email,
                password
            );
            const user = userCredential.user;
            // 2. FORCE Firestore creation immediately
            // .unwrap() ensures that if Firestore fails, we jump to the catch block
            await thunkAPI.dispatch(
                createUserProfile({
                    uid: user.uid,
                    provider: 'password',
                })
            )
            Toast.show({ type: 'success', text1: 'Account Created', text2: 'Welcome to the app!' });
            return serializeUser(userCredential.user);
        } catch (error) {
            // This will catch BOTH Auth errors and Firestore creation errors
            const message = typeof error === 'string'
                ? error
                : getReadableErrorMessage(error.code);

            Toast.show({
                type: 'error',
                text1: 'Signup Failed',
                text2: message
            });
            return thunkAPI.rejectWithValue(message);
        }
    }
);
export const forgotPassword = createAsyncThunk(
    'auth/forgotPassword',
    async (email, thunkAPI) => {
        try {
            await sendPasswordResetEmail(getAuth(), email);

            Toast.show({
                type: 'success',
                text1: 'Reset Link Sent',
                text2: 'Check your email to reset your password',
            });

            return true;
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Reset Failed',
                text2: error.message || 'Unable to send reset link',
            });

            return thunkAPI.rejectWithValue(error.message);
        }
    }
);
export const deleteAccount = createAsyncThunk(
    'auth/deleteAccount',
    async ({ password }, thunkAPI) => {
        try {
            // ✅ Use the Modular way to get Auth and DB instances
            const firebaseApp = getApp();
            const authInstance = getAuth(firebaseApp);
            const db = getFirestore(firebaseApp);

            const user = authInstance.currentUser;
            if (!user) throw new Error("No user session found");
            const uid = user.uid;

            // 1. RE-AUTHENTICATE
            const isGoogleUser = user.providerData.some(p => p.providerId === 'google.com');

            if (isGoogleUser) {
                const response = await GoogleSignin.signIn();
                const idToken = response.data?.idToken || response.idToken;
                const googleCred = GoogleAuthProvider.credential(idToken);
                await reauthenticateWithCredential(user, googleCred);
            } else {
                if (!password) return thunkAPI.rejectWithValue("Password required");

                const emailCred = EmailAuthProvider.credential(
                    user.email,
                    password
                );

                await user.reauthenticateWithCredential(emailCred);
            }

            // 2. MODULAR FIRESTORE DATA CLEANUP
            const batch = writeBatch(db);

            const subCollections = ['customers', 'milkEntries', 'meta'];
            for (const name of subCollections) {
                const ref = collection(db, 'users', uid, name);
                const snap = await getDocs(ref);
                snap.forEach(d => batch.delete(d.ref));
            }

            batch.delete(doc(db, 'users', uid));
            await batch.commit();

            // 3. FINAL AUTH DELETE
            await deleteUser(user);

            Toast.show({ type: 'success', text1: 'Account Removed', text2: 'Your data has been wiped.' });
            return null;

        } catch (error) {
            console.error("Delete Flow Error:", error);
            let message = "Deletion failed, Try again later or Contact support for account deletion";
            if (error.code === 'auth/wrong-password') message = "Incorrect password.";

            Toast.show({ type: 'error', text1: 'Error', text2: message });
            return thunkAPI.rejectWithValue(message);
        }
    }
);
export const deleteGoogleAccount = createAsyncThunk(
    'auth/deleteGoogleAccount',
    async (_, thunkAPI) => {
        try {
            const firebaseApp = getApp();
            const user = getAuth(firebaseApp).currentUser;
            const db = getFirestore(firebaseApp);
            if (!user) throw new Error("No user found");

            const response = await GoogleSignin.signIn();
            const idToken = response.data?.idToken || response.idToken;
            const credential = GoogleAuthProvider.credential(idToken);
            await reauthenticateWithCredential(user, credential);

            await cleanupUserData(db, user.uid);
            await deleteUser(user);

            Toast.show({ type: 'success', text1: 'Success', text2: 'Account and data deleted.' });
            return null;
        } catch (error) {
            console.error("Google Delete Error:", error);
            const message = "Google verification failed. Please try again.";
            Toast.show({ type: 'error', text1: 'Error', text2: message });
            return thunkAPI.rejectWithValue(message);
        }
    }
);
export const deleteEmailAccount = createAsyncThunk(
    'auth/deleteEmailAccount',
    async ({ password }, thunkAPI) => {
        try {
            const firebaseApp = getApp();
            const user = getAuth(firebaseApp).currentUser;
            const db = getFirestore(firebaseApp);
            if (!user) throw new Error("No user found");

            const credential = EmailAuthProvider.credential(user.email, password);
            await user.reauthenticateWithCredential(credential);

            await cleanupUserData(db, user.uid);
            await deleteUser(user);

            Toast.show({ type: 'success', text1: 'Success', text2: 'Account and data deleted.' });
            return null;
        } catch (error) {
            console.error("Email Delete Error:", error);
            let message = "Deletion failed.";
            if (error.code === 'auth/wrong-password') message = "Incorrect password.";
            if (error.code === 'auth/requires-recent-login') message = "Please re-login to delete account.";

            Toast.show({ type: 'error', text1: 'Error', text2: message });
            return thunkAPI.rejectWithValue(message);
        }
    }
);
export const verifyOtpAndLogin = createAsyncThunk(
    'auth/verifyOtpAndLogin',
    async ({ confirmation, otp }, thunkAPI) => {
        try {
            // 1. Validate the code with Firebase
            // 'confirmation' is the object you saved in local state earlier
            const userCredential = await confirmation.confirm(otp);

            Toast.show({
                type: 'success',
                text1: 'Login Successful',
                text2: 'Welcome to the app!'
            });

            // 2. Return serialized user data for Redux state
            return serializeUser(userCredential.user);
        } catch (error) {
            // Use your existing helper for readable errors
            console.log('Otp Error', error.code);

            const message = getReadableErrorMessage(error.code);
            Toast.show({ type: 'error', text1: 'Verification Failed', text2: message });
            return thunkAPI.rejectWithValue(message);
        }
    }
);

const cleanupUserData = async (db, uid) => {
    const batch = writeBatch(db);
    const collections = ['customers', 'milkEntries', 'meta'];
    for (const colName of collections) {
        const snap = await getDocs(collection(db, 'users', uid, colName));
        snap.forEach(d => batch.delete(d.ref));
    }
    batch.delete(doc(db, 'users', uid));
    await batch.commit();
};

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        loginLoading: false,
        logoutLoading: false,
        signUpLoading: false,
        googleLoginLoading: false,
        forgotPasswordLoading: false,
        error: null,
        authError: null,
        deleteAccountLoading: false,
        otpVerifyLoading: false,

    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // =====================
            // LOGIN WITH EMAIL
            // =====================
            .addCase(loginWithEmail.pending, (state) => {
                state.loginLoading = true;
                state.error = null;
            })
            .addCase(loginWithEmail.fulfilled, (state) => {
                state.loginLoading = false;
            })
            .addCase(loginWithEmail.rejected, (state, action) => {
                state.loginLoading = false;
                state.error = action.payload;
            })

            // =====================
            // LOGIN WITH GOOGLE
            // =====================
            .addCase(loginWithGoogle.pending, (state) => {
                state.googleLoginLoading = true;
                state.error = null;
            })
            .addCase(loginWithGoogle.fulfilled, (state) => {
                state.googleLoginLoading = false;
            })
            .addCase(loginWithGoogle.rejected, (state, action) => {
                state.googleLoginLoading = false;
                state.error = action.payload;
            })

            // =====================
            // SIGNUP WITH EMAIL
            // =====================
            .addCase(signupWithEmail.pending, (state) => {
                state.signUpLoading = true;
                state.error = null;
            })
            .addCase(signupWithEmail.fulfilled, (state) => {
                state.signUpLoading = false;
            })
            .addCase(signupWithEmail.rejected, (state, action) => {
                state.signUpLoading = false;
                state.error = action.payload;
            })

            // =====================
            // LOGOUT
            // =====================
            .addCase(logoutUser.pending, (state) => {
                state.logoutLoading = true;
                state.error = null;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.logoutLoading = false;
                state.user = null; // safe, listener will also clear
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.logoutLoading = false;
                state.error = action.payload;
            })

            .addCase(forgotPassword.pending, (state) => {
                state.forgotPasswordLoading = true;
                state.authError = null;
            })
            .addCase(forgotPassword.fulfilled, (state) => {
                state.forgotPasswordLoading = false;
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.forgotPasswordLoading = false;
                state.authError = action.payload;
            })
            // =====================
            // UPDATE PROFILE (From UserSlice)
            // =====================
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                if (state.user) {
                    state.user = {
                        ...state.user,
                        ...action.payload // This will now overwrite displayName and name
                    };
                }
            })
            // Delete User
            .addCase(deleteAccount.pending, (state) => {
                state.deleteAccountLoading = true;
                state.error = null;
            })
            .addCase(deleteAccount.fulfilled, (state) => {
                state.deleteAccountLoading = false;
                state.user = null; // Clear user from state
            })
            .addCase(deleteAccount.rejected, (state, action) => {
                state.deleteAccountLoading = false;
                state.error = action.payload;
            })
            // --- Google Deletion Cases ---
            .addCase(deleteGoogleAccount.pending, (state) => {
                state.deleteAccountLoading = true;
                state.error = null;
            })
            .addCase(deleteGoogleAccount.fulfilled, (state) => {
                state.deleteAccountLoading = false;
                state.user = null; // Clear user on success
            })
            .addCase(deleteGoogleAccount.rejected, (state, action) => {
                state.deleteAccountLoading = false;
                state.error = action.payload;
            })

            // --- Email Deletion Cases ---
            .addCase(deleteEmailAccount.pending, (state) => {
                state.deleteAccountLoading = true;
                state.error = null;
            })
            .addCase(deleteEmailAccount.fulfilled, (state) => {
                state.deleteAccountLoading = false;
                state.user = null; // Clear user on success
            })
            .addCase(deleteEmailAccount.rejected, (state, action) => {
                state.deleteAccountLoading = false;
                state.error = action.payload;
            })
            // Handle Phone Verification Success
            .addCase(verifyOtpAndLogin.pending, (state) => {
                state.otpVerifyLoading = true;
            })
            .addCase(verifyOtpAndLogin.fulfilled, (state, action) => {
                state.otpVerifyLoading = false;
                state.user = action.payload; // Saves the serialized user
            })
            .addCase(verifyOtpAndLogin.rejected, (state) => {
                state.otpVerifyLoading = false;
            });

    },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
