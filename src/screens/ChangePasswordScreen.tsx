import React, { useState } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, ScrollView, TextInput } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Feather from 'react-native-vector-icons/Feather'
import { Responsive } from '../utilities/Responsive'
import { Colors } from '../utilities/AppTheme'

const ChangePasswordScreen = () => {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={[styles.header, { paddingTop: insets.top + Responsive.spacing[15] }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={Responsive.fontSize[24]} color={Colors.text.inverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: Responsive.spacing[40] }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Current Password</Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="lock" size={Responsive.fontSize[20]} color={Colors.text.secondary} />
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              placeholderTextColor={Colors.text.disabled}
              secureTextEntry
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>New Password</Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="lock" size={Responsive.fontSize[20]} color={Colors.text.secondary} />
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              placeholderTextColor={Colors.text.disabled}
              secureTextEntry
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm New Password</Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="lock" size={Responsive.fontSize[20]} color={Colors.text.secondary} />
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              placeholderTextColor={Colors.text.disabled}
              secureTextEntry
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} activeOpacity={0.8}>
          <Text style={styles.saveButtonText}>Update Password</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

export default ChangePasswordScreen

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Responsive.spacing[20], paddingBottom: Responsive.spacing[15], backgroundColor: Colors.primary },
  headerTitle: { fontSize: Responsive.fontSize[20], fontWeight: 'bold', color: Colors.text.inverse },
  content: { flex: 1, paddingHorizontal: Responsive.spacing[20], paddingTop: Responsive.spacing[20] },
  inputGroup: { marginBottom: Responsive.spacing[20] },
  label: { fontSize: Responsive.fontSize[14], fontWeight: '600', color: Colors.text.primary, marginBottom: Responsive.spacing[8] },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Responsive.radius[12], paddingHorizontal: Responsive.padding[15], borderWidth: 1, borderColor: Colors.border.default },
  input: { flex: 1, fontSize: Responsive.fontSize[15], color: Colors.text.primary, paddingVertical: Responsive.padding[12], paddingLeft: Responsive.padding[12] },
  saveButton: { backgroundColor: Colors.primary, paddingVertical: Responsive.padding[15], borderRadius: Responsive.radius[12], alignItems: 'center', marginTop: Responsive.spacing[20] },
  saveButtonText: { fontSize: Responsive.fontSize[16], fontWeight: '600', color: Colors.text.inverse },
})
