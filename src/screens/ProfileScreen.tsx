import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, ScrollView, Image, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Feather from 'react-native-vector-icons/Feather'
import { Responsive } from '../utilities/Responsive'
import { Colors } from '../utilities/AppTheme'
import GradientBackground from '../components/GradientBackground'
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../redux/slice/authSlice'
const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user, logoutLoading, deleteAccountLoading } = useSelector((state) => state.auth)
  const menuItems = [
    { id: 1, title: 'Edit Profile', icon: 'edit', screen: 'EditProfile' },
    { id: 2, title: 'My Bookings', icon: 'confirmation-number', screen: 'MyBookings' },
    // { id: 3, title: 'Payment Methods', icon: 'payment', screen: 'PaymentMethods' },
    { id: 4, title: 'Notifications', icon: 'notifications', screen: 'Notifications' },
    { id: 5, title: 'Settings', icon: 'settings', screen: 'Settings' },
    { id: 6, title: 'Help & Support', icon: 'help', screen: 'HelpSupport' },
  ]

  return (
    <GradientBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Responsive.spacing[15] }]}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + Responsive.spacing[40] }}

      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
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
          <Text style={styles.userName}>{user?.displayName}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => {
                navigation.navigate(item.screen);
                // console.log('Navigation Clicked', item.screen);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconWrapper}>
                <MaterialIcons name={item.icon} size={Responsive.fontSize[24]} color={Colors.text.secondary} />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Feather name="chevron-right" size={Responsive.fontSize[20]} color={Colors.text.secondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}

       

     

        <View style={{ height: insets.bottom + Responsive.spacing[20] }} />
      </ScrollView>
    </GradientBackground>
  )
}

export default ProfileScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Responsive.spacing[20],
    paddingBottom: Responsive.spacing[15],
    backgroundColor: Colors.primary,
  },
  headerTitle: {
    fontSize: Responsive.fontSize[20],
    fontWeight: 'bold',
    color: Colors.text.inverse,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: Responsive.padding[30],
    backgroundColor: 'transparent',
  },
  avatarContainer: {
    marginBottom: Responsive.spacing[5],
  },
  userName: {
    fontSize: Responsive.fontSize[24],
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Responsive.spacing[5],
  },
  userEmail: {
    fontSize: Responsive.fontSize[14],
    color: Colors.text.secondary,
  },
  menuContainer: {
    paddingHorizontal: Responsive.spacing[20],
    marginTop: Responsive.spacing[10],
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  menuIconWrapper: {
    width: Responsive.size.wp(10),
    height: Responsive.size.wp(10),
    borderRadius: Responsive.size.wp(5),
    backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Responsive.spacing[15],
  },
  menuTitle: {
    flex: 1,
    fontSize: Responsive.fontSize[16],
    color: Colors.text.primary,
    fontWeight: '500',
  },
 
})
