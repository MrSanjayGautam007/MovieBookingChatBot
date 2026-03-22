import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getApp } from '@react-native-firebase/app';
import { getAuth, reload, updateProfile } from '@react-native-firebase/auth';

import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '@env';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from '@react-native-firebase/firestore';


import Toast from 'react-native-toast-message';
import { Platform } from 'react-native';

const db = getFirestore(getApp());


const getReadableFirestoreError = (code) => {
  switch (code) {
    case 'permission-denied':
      return 'You do not have permission to perform this action.';
    case 'not-found':
      return 'User profile not found.';
    case 'unavailable':
      return 'Service temporarily unavailable. Please try again.';
    case 'deadline-exceeded':
      return 'Request timed out. Please try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
};

export const createUserProfile = createAsyncThunk(
  'user/createProfile',
  async ({ uid, provider }, thunkAPI) => {
    try {
      if (!uid) throw new Error("User ID is required");
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);

      // if (!snap.exists()) {
      //   await setDoc(userRef, {
      //     role: 'user',
      //     phone: null,
      //     provider,
      //     createdAt: serverTimestamp(),
      //   });
      // }

      // return true;
      if (!snap.exists()) {
        // 2. Only Create if brand new
        const initialData = {
          uid,
          role: 'user',
          phone: null,
          photoURL: null, // Default placeholder
          provider: provider || 'email',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await setDoc(userRef, initialData);
        // console.log("Firestore: New profile created successfully.");
        return initialData;
      }

      // 3. If it exists, return the existing data to sync Redux
      // console.log("Firestore: Profile already exists, skipping creation.");
      return snap.data();
    } catch (error) {
      console.error("Create Profile Error:", error);

      // Handle the error message safely
      const errorMessage = error.code ? getReadableFirestoreError(error.code) : error.message;

      Toast.show({
        type: 'error',
        text1: 'Profile Error',
        text2: errorMessage,
      });
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (uid, thunkAPI) => {
    try {
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);
      return snap.exists() ? snap.data() : null;
    } catch (error) {
      const message = getReadableFirestoreError(error.code);
      Toast.show({
        type: 'error',
        text1: 'Profile Load Failed',
        text2: message,
      });
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async ({ uid, name, phone, }, thunkAPI) => {
    // console.log('User update pressed thunk', uid, name, phone, photoURL);

    try {
      // 
      const auth = getAuth(getApp());
      const currentUser = auth.currentUser;

      if (currentUser) {
        await updateProfile(currentUser, {
          displayName: name,
          phoneNumber: phone,

        });
        await reload(currentUser);
      }

      // 2️⃣ Update Firestore user document
      const userRef = doc(db, 'users', uid);

      await updateDoc(userRef, {
        name,
        phone,
        updatedAt: serverTimestamp(),
      });


      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Your profile has been updated successfully.',
      });
      // console.log('Updated details', name, phone, photoURL);

      return {
        name,
        displayName: name,
        phone,

      };
    } catch (error) {

      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: 'Unable to update profile. Please try again.',
      });
      // console.log(error);

      return thunkAPI.rejectWithValue('Profile update failed');
    }
  }
);


export const updateProfilePhoto = createAsyncThunk(
  'user/updateProfilePhoto',
  async ({ uid, image }, { rejectWithValue }) => {
    try {
      return await new Promise((resolve, reject) => {
        const cloudName = CLOUDINARY_CLOUD_NAME;
        const uploadPreset = CLOUDINARY_UPLOAD_PRESET;
        const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);

        xhr.onload = async () => {
          const response = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            const photoURL = response.secure_url;

            // Update Firebase Auth & Firestore
            const auth = getAuth();

            const user = auth.currentUser;

            if (user) {
              // 1. Update the profile
              await updateProfile(user, { photoURL: photoURL });

              // 2. The FIX: Use the reload function from firebase/auth
              // NOT user.reload (deprecated) and NOT user.reload() (namespaced)
              await reload(user);

              // console.log("Auth Refreshed successfully");
            }

            await updateDoc(doc(db, 'users', uid), {
              photoURL,
              updatedAt: serverTimestamp(),
            });

            resolve(photoURL);
          } else {
            reject(response.error?.message || 'Upload failed');
          }
        };

        xhr.onerror = () => reject('Network request failed');

        const formData = new FormData();
        formData.append('file', `data:image/jpeg;base64,${image.data}`);
        formData.append('upload_preset', uploadPreset);
        xhr.send(formData);
      });
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);
export const deleteProfilePhoto = createAsyncThunk(
  'user/deleteProfilePhoto',
  async ({ uid }, { rejectWithValue }) => {
    try {
      // 1. Update Firebase Auth
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        // Update Auth
        await updateProfile(user, { photoURL: null });

        // Use the MODULAR reload function
        await reload(user);
        // console.log("Auth Refreshed successfully");
      }
      // 2. Update Firestore Document
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, {
        photoURL: null,
        updatedAt: serverTimestamp(),
      });

      Toast.show({ type: 'success', text1: 'Photo removed' });
      return null; // The new value for photoURL
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: null,
    fetchLoading: false,
    createLoading: false,
    updateLoading: false,
    uploadProgress: 0,
    profilePicDeleteLoading: false,
  },
  reducers: {
    clearProfile: (state) => {
      state.profile = null;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // =====================
      // FETCH PROFILE
      // =====================
      .addCase(fetchUserProfile.pending, (state) => {
        state.fetchLoading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.fetchLoading = false;
      })
      .addCase(fetchUserProfile.rejected, (state) => {
        state.fetchLoading = false;
      })

      // =====================
      // CREATE PROFILE
      // =====================
      .addCase(createUserProfile.pending, (state) => {
        state.createLoading = true;
      })
      .addCase(createUserProfile.fulfilled, (state) => {
        // state.create = false;
        state.createLoading = false
      })
      .addCase(createUserProfile.rejected, (state) => {
        state.createLoading = false;
      })

      // Update User Details
      .addCase(updateUserProfile.pending, (state) => {
        state.updateLoading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.profile = {
          ...state.profile,
          ...action.payload,
        };
        state.updateLoading = false;
      })
      .addCase(updateUserProfile.rejected, (state) => {
        state.updateLoading = false;
      })

      .addCase(updateProfilePhoto.pending, (state) => {
        state.profilePicLoading = true;
      })
      .addCase(updateProfilePhoto.fulfilled, (state, action) => {
        state.profilePicLoading = false;
        // If state.profile is null, initialize it as an object
        if (!state.profile) {
          state.profile = {};
        }
        state.profile.photoURL = action.payload;
        Toast.show({ type: 'success', text1: 'Profile Photo Updated' });
      })
      .addCase(updateProfilePhoto.rejected, (state, action) => {
        state.profilePicLoading = false;
        Toast.show({ type: 'error', text1: 'Update Failed', text2: action.payload });
      })
      // delete profile pic
      .addCase(deleteProfilePhoto.pending, (state) => {
        state.profilePicDeleteLoading = true;
      })

      .addCase(deleteProfilePhoto.fulfilled, (state) => {
        state.profilePicDeleteLoading = false;
        if (state.profile) {
          state.profile.photoURL = null; // Clear the URL in Redux state
        }
      })
      .addCase(deleteProfilePhoto.rejected, (state, action) => {
        state.profilePicDeleteLoading = false;
        Toast.show({ type: 'error', text1: 'Delete failed', text2: action.payload });
      });
  },

});
export const { clearProfile, } = userSlice.actions;
export default userSlice.reducer;
