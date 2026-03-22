
import ImagePicker from 'react-native-image-crop-picker';
import Toast from 'react-native-toast-message';
import { Alert, Linking } from 'react-native';

export const pickImageFromGallery = async () => {
    try {
        const image = await ImagePicker.openPicker({
            width: 500,
            height: 500,
            cropping: true,
            cropperCircleOverlay: true,
            compressImageQuality: 0.2,
            mediaType: 'photo',
            forceJpg: true,
            includeBase64: true
        });

        // RETURN RAW IMAGE (KEEP path)
        return image;
    } catch (error) {
        if (error.code === 'E_PICKER_CANCELLED') return null;

        if (
            error.message?.includes('permission') ||
            error.code === 'E_PERMISSION_MISSING'
        ) {
            Alert.alert(
                'Gallery Permission Denied',
                'Please enable photo access from app settings.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Open Settings', onPress: Linking.openSettings },
                ]
            );
            return null;
        }

        Toast.show({
            type: 'error',
            text1: 'Gallery Error',
            text2: 'Unable to access photos.',
        });

        return null;
    }
};

export const pickImageFromCamera = async () => {
    try {
        const image = await ImagePicker.openCamera({
            width: 500,
            height: 500,
            cropping: true,
            cropperCircleOverlay: true,
            compressImageQuality: 0.2,
            mediaType: 'photo',
            forceJpg: true,
            includeBase64: true
        });

        // RETURN RAW IMAGE (KEEP path)
        return image;
    } catch (error) {
        if (error.code === 'E_PICKER_CANCELLED') return null;

        if (
            error.message?.includes('permission') ||
            error.code === 'E_PERMISSION_MISSING'
        ) {
            Alert.alert(
                'Camera Permission Required',
                'Please enable camera access from app settings.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Open Settings', onPress: Linking.openSettings },
                ]
            );
            return null;
        }

        Toast.show({
            type: 'error',
            text1: 'Camera Error',
            text2: 'Something went wrong while opening camera.',
        });

        return null;
    }
};

export const removePickedImageCache = async () => {
    await ImagePicker.clean();
};
