import React, { useState } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, Platform, ToastAndroid, Alert, Modal, KeyboardAvoidingView, ScrollView, ActivityIndicator, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Feather from 'react-native-vector-icons/Feather'
import { Responsive } from '../utilities/Responsive'
import { Colors } from '../utilities/AppTheme'
import { useDispatch, useSelector } from 'react-redux'
import { deleteEmailAccount, deleteGoogleAccount } from '../redux/slice/authSlice'

const DeleteAccountScreen = () => {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const dispatch = useDispatch();
  const [confirmed, setConfirmed] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteType, setDeleteType] = useState(null); // 'email' or 'google'
  const [password, setPassword] = useState('');
  const { user, deleteAccountLoading } = useSelector((state: any) => state.auth)

  const handleDeleteAccountPress = () => {
    const isGoogleUser = user?.providerId === 'google.com';
    // Set type first, then show modal
    setDeleteType(isGoogleUser ? 'google' : 'email');
    setDeleteModalVisible(true);
  };
  const onConfirmDelete = async () => {
    if (Platform.OS === 'android') {
      ToastAndroid.show('Processing deletion...', ToastAndroid.SHORT);
    }

    let resultAction;

    if (deleteType === 'google') {
      resultAction = await dispatch(deleteGoogleAccount());
    } else {
      if (!password) {
        Alert.alert("Error", "Password is required.");
        return;
      }
      resultAction = await dispatch(deleteEmailAccount({ password }));
    }

    // Common Cleanup
    if (deleteGoogleAccount.fulfilled.match(resultAction) || deleteEmailAccount.fulfilled.match(resultAction)) {
      setDeleteModalVisible(false);
      setPassword('');
      setDeleteType(null);
    }
  };
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={[styles.header, { paddingTop: insets.top + Responsive.spacing[15] }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={Responsive.fontSize[24]} color={Colors.text.inverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delete Account</Text>
        <View style={{ width: Responsive.spacing[40] }} />
      </View>

      <View style={styles.content}>
        <MaterialIcons name="warning" size={Responsive.fontSize[80]} color={Colors.status.error} />
        <Text style={styles.title}>Delete Your Account?</Text>
        <Text style={styles.subtitle}>
          This action cannot be undone. All your data including bookings, payment methods, and preferences will be permanently deleted.
        </Text>

        <View style={styles.warningBox}>
          <Text style={styles.warningText}>• All booking history will be lost</Text>
          <Text style={styles.warningText}>• Saved payment methods will be removed</Text>
          <Text style={styles.warningText}>• You won't be able to recover this account</Text>
        </View>

        <TouchableOpacity style={styles.deleteButton} activeOpacity={0.8}

          onPress={handleDeleteAccountPress}

        >
          <Text style={styles.deleteButtonText}>Yes, Delete My Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
      <Modal
        visible={isDeleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
        statusBarTranslucent
      >

        <KeyboardAvoidingView
          behavior={'padding'}
          style={{ flex: 1 }}
        >

          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

              <View style={StyleSheet.absoluteFill} />
            </TouchableWithoutFeedback>

            <View style={styles.modalContent}>

              <ScrollView
                bounces={false}
                style={{ flexShrink: 1 }}
                contentContainerStyle={{ paddingBottom: Responsive.spacing[20] }}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={styles.modalTitle}>Delete Account</Text>

                <Text style={styles.modalSubTitle}>
                  {deleteType === 'google'
                    ? "To protect your data, we need to verify your Google account one last time."
                    : "Please enter your password to confirm permanent account deletion."
                  }
                </Text>

                {deleteType === 'email' && (
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter Password"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    placeholderTextColor={Colors.text.secondary}
                    autoFocus
                    accessibilityLabel="Password input for account deletion"
                  />
                )}

                <View style={styles.modalActionRow}>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.cancelBtn]}
                    onPress={() => {
                      setDeleteModalVisible(false);
                      setPassword('');
                      setDeleteType(null);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalBtn, styles.confirmDeleteBtn]}
                    onPress={onConfirmDelete}
                    disabled={deleteAccountLoading}
                    activeOpacity={0.7}
                  >
                    {deleteAccountLoading ? (
                      <ActivityIndicator size="small" color={Colors.text.primary} />
                    ) : (
                      <Text style={styles.deleteBtnModalText}>
                        {deleteType === 'google' ? 'Verify' : 'Delete'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}

export default DeleteAccountScreen

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Responsive.spacing[20], paddingBottom: Responsive.spacing[15], backgroundColor: Colors.primary },
  headerTitle: { fontSize: Responsive.fontSize[20], fontWeight: 'bold', color: Colors.text.inverse },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Responsive.spacing[30] },
  title: { fontSize: Responsive.fontSize[24], fontWeight: 'bold', color: Colors.text.primary, marginTop: Responsive.spacing[20], marginBottom: Responsive.spacing[15] },
  subtitle: { fontSize: Responsive.fontSize[14], color: Colors.text.secondary, textAlign: 'center', lineHeight: 22, marginBottom: Responsive.spacing[25] },
  warningBox: { width: '100%', backgroundColor: `${Colors.status.error}10`, borderRadius: Responsive.radius[12], padding: Responsive.padding[20], marginBottom: Responsive.spacing[30] },
  warningText: { fontSize: Responsive.fontSize[13], color: Colors.text.primary, marginBottom: Responsive.spacing[8] },
  deleteButton: { width: '100%', backgroundColor: Colors.status.error, paddingVertical: Responsive.padding[15], borderRadius: Responsive.radius[12], alignItems: 'center', marginBottom: Responsive.spacing[15] },
  deleteButtonText: { fontSize: Responsive.fontSize[16], fontWeight: '600', color: Colors.text.inverse },
  cancelButton: { width: '100%', paddingVertical: Responsive.padding[15], borderRadius: Responsive.radius[12], alignItems: 'center', borderWidth: 1, borderColor: Colors.border.default },
  cancelButtonText: { fontSize: Responsive.fontSize[16], fontWeight: '600', color: Colors.text.primary },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: Colors.surface,
    borderRadius: Responsive.radius[12],
    padding: Responsive.padding[20],

    maxHeight: Platform.OS === 'ios' ? '70%' : '80%',
    elevation: 5,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  scrollContainer: {
    flexGrow: 0,
  },
  modalTitle: {
    fontSize: Responsive.fontSize[18],
    fontWeight: 'bold',
    color: Colors.text.inverse,
    marginBottom: Responsive.spacing[10],
  },
  modalSubTitle: {
    fontSize: Responsive.fontSize[13],
    color: Colors.text.inverse,
    textAlign: 'center',
    marginBottom: Responsive.spacing[10],
  },
  passwordInput: {
    width: '100%',
    height: Responsive.size.hp(6),
    borderWidth: 1,
    borderColor: Colors.border.default,
    borderRadius: Responsive.radius[8],
    paddingHorizontal: Responsive.padding[10],
    color: Colors.text.primary,
    marginBottom: Responsive.spacing[10],
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: Responsive.spacing[10],
    marginTop: Responsive.spacing[10],
  },
  modalBtn: {
    flex: 1,
    height: Responsive.size.hp(5),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Responsive.radius[8],
  },
  cancelBtn: {
    backgroundColor: Colors.surface,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    borderWidth: 0.5,
    borderColor: Colors.border.default,

  },
  confirmDeleteBtn: {
    backgroundColor: Colors.status.error,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    borderWidth: 0.5,
    borderColor: Colors.border.default,

  },
  cancelBtnText: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  deleteBtnModalText: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
})
