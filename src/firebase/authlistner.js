
import { getApp } from '@react-native-firebase/app';
import auth, { onAuthStateChanged } from '@react-native-firebase/auth';
import { setUser } from '../redux/slice/authSlice';
// import { createUserProfile, fetchUserProfile } from '../redux/slice/userSlice';
import { clearProfile, createUserProfile, fetchUserProfile } from '../redux/slice/userProfileSlice';

export const listenToAuthChanges = (dispatch) => {
    const app = getApp();

    return onAuthStateChanged(auth(app), async (user) => {
        try {
            if (!user) {
                dispatch(setUser(null));
                dispatch(clearProfile());
                return;
            }

            // 1️⃣ Auth state
            // console.log('User in auth listner', user);

            const serialized = serializeUser(user);
            dispatch(setUser(serialized));

            // 2️⃣ Ensure Firestore profile exists
            // await dispatch(
            //     createUserProfile({
            //         uid: user.uid,
            //         provider: user.providerData[0]?.providerId,
            //     })
            // );
            await dispatch(
                createUserProfile({
                    uid: user.uid,
                    provider: user.providerData[0]?.providerId,
                })
            )

            // 3️⃣ Fetch Firestore profile
            await dispatch(fetchUserProfile(user.uid))
        } catch (error) {
            console.error("Auth Listener Sync Error:", error);

        }
    });
};
// const serializeUser = (user) => {
//     if (!user) return null;
//     return {
//         uid: user.uid,
//         email: user.email,
//         displayName: user.displayName,
//         photoURL: user.photoURL,
//         // Firebase providerId is usually 'password' or 'google.com'
//         providerId: user.providerData[0]?.providerId || 'password',
//     };
// };
const serializeUser = (user) => {
    if (!user) return null;
    const providers = user.providerData.map(p => p.providerId);
    return {
        uid: user.uid,
        email: user.email,
        phoneNumber: user.phoneNumber, // Added this since you're using Phone Auth!
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
