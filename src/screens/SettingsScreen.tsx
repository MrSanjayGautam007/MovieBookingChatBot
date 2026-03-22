import React, { useState } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, ScrollView, Switch, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Feather from 'react-native-vector-icons/Feather'
import { Responsive } from '../utilities/Responsive'
import { Colors } from '../utilities/AppTheme'
import GradientBackground from '../components/GradientBackground'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../redux/slice/authSlice'

const SettingsScreen = () => {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user, logoutLoading, deleteAccountLoading } = useSelector((state: any) => state.auth)

  const [notifications, setNotifications] = useState(true)
  const [emailAlerts, setEmailAlerts] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  const settingsSections = [
    {
      title: 'Preferences',
      items: [
        { id: 1, label: 'Push Notifications', value: notifications, onToggle: setNotifications, type: 'switch' },
        { id: 2, label: 'Email Alerts', value: emailAlerts, onToggle: setEmailAlerts, type: 'switch' },
        // { id: 3, label: 'Dark Mode', value: darkMode, onToggle: setDarkMode, type: 'switch' },
      ],
    },
    {
      title: 'Account',
      items: [
        { id: 4, label: 'Change Password', icon: 'lock', screen: 'ChangePassword', type: 'nav' },
        { id: 5, label: 'Privacy Settings', icon: 'security', screen: 'PrivacyPolicy', type: 'nav' },
        { id: 6, label: 'Delete Account', icon: 'delete', screen: 'DeleteAccount', type: 'nav' },
      ],
    },
    {
      title: 'About',
      items: [
        { id: 7, label: 'Terms & Conditions', icon: 'description', screen: 'TermsConditions', type: 'nav' },
        { id: 8, label: 'Privacy Policy', icon: 'policy', screen: 'PrivacyPolicy', type: 'nav' },

      ],
    },
  ]
  const handleLogOut = () => {
    dispatch(logoutUser())

  };
  return (
    <GradientBackground>

      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Responsive.spacing[15] }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={Responsive.fontSize[24]} color={Colors.text.inverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {settingsSections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item) => (
              <View key={item.id} style={styles.settingItem}>
                {item.type === 'switch' ? (
                  <>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: Colors.border.default, true: Colors.primary }}
                      thumbColor={'skyblue'}
                    />
                  </>
                ) : item.type === 'nav' ? (
                  <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => navigation.navigate(item.screen as never)}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name={item.icon} size={Responsive.fontSize[22]} color={Colors.text.secondary} />
                    <Text style={styles.navLabel}>{item.label}</Text>
                    <Feather name="chevron-right" size={Responsive.fontSize[20]} color={Colors.text.secondary} />
                  </TouchableOpacity>
                ) : (
                  <>
                    <View style={styles.textItem}>
                      <MaterialIcons name={item.icon} size={Responsive.fontSize[22]} color={Colors.text.secondary} />
                      <Text style={styles.textLabel}>{item.label}</Text>
                    </View>
                    <Text style={styles.textValue}>{item.value}</Text>
                  </>
                )}
              </View>
            ))}
          </View>
        ))}
        <TouchableOpacity
          onPress={handleLogOut}
          disabled={logoutLoading}
          style={styles.logoutButton}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Log out"
          accessibilityState={{ busy: logoutLoading }}

        >
          {
            logoutLoading ? (
              <ActivityIndicator size={Responsive.fontSize[22]} color={'#FF5252'} />
            ) : (
              <>
                <MaterialIcons name="logout" size={Responsive.fontSize[20]} color={Colors.status.error} />
                <Text style={styles.logoutText}>Log Out</Text>
              </>
            )}
        </TouchableOpacity>
        <Text style={styles.appVersion}>App Version 1.0.0   </Text>
        <View style={{ height: insets.bottom + Responsive.spacing[20] }} />
      </ScrollView>
    </GradientBackground>
  )
}

export default SettingsScreen

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
  content: {
    flex: 1,
    paddingHorizontal: Responsive.spacing[20],
  },
  section: {
    marginTop: Responsive.spacing[15],
  },
  sectionTitle: {
    fontSize: Responsive.fontSize[14],
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: Responsive.spacing[10],
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: Responsive.padding[15],
    borderRadius: Responsive.radius[12],
    marginBottom: Responsive.spacing[10],
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  settingLabel: {
    fontSize: Responsive.fontSize[16],
    color: Colors.text.primary,
    fontWeight: '500',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  navLabel: {
    flex: 1,
    fontSize: Responsive.fontSize[16],
    color: Colors.text.primary,
    fontWeight: '500',
    marginLeft: Responsive.spacing[12],
  },
  textItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textLabel: {
    fontSize: Responsive.fontSize[16],
    color: Colors.text.primary,
    fontWeight: '500',
    marginLeft: Responsive.spacing[12],
  },
  textValue: {
    fontSize: Responsive.fontSize[14],
    color: Colors.text.secondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Responsive.spacing[20],
    marginTop: Responsive.spacing[10],
    padding: Responsive.padding[15],
    borderRadius: Responsive.radius[12],
    borderWidth: 1,
    borderColor: Colors.status.error,
  },
  logoutText: {
    fontSize: Responsive.fontSize[16],
    color: Colors.status.error,
    fontWeight: '600',
    marginLeft: Responsive.spacing[10],
  },
  appVersion: {
    fontSize: Responsive.fontSize[12],
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Responsive.spacing[10],
  },
})
