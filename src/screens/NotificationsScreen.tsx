import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Feather from 'react-native-vector-icons/Feather'
import { Responsive } from '../utilities/Responsive'
import { Colors } from '../utilities/AppTheme'

const NotificationsScreen = () => {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()

  const notifications = [
    { id: 1, title: 'Booking Confirmed', message: 'Your booking for Avengers is confirmed', time: '2 hours ago', read: false },
    { id: 2, title: 'New Movie Release', message: 'Inception is now showing in theaters', time: '1 day ago', read: true },
    { id: 3, title: 'Payment Successful', message: 'Payment of ₹500 received', time: '2 days ago', read: true },
  ]

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={[styles.header, { paddingTop: insets.top + Responsive.spacing[15] }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={Responsive.fontSize[24]} color={Colors.text.inverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: Responsive.spacing[40] }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {notifications.map((notif) => (
          <TouchableOpacity key={notif.id} style={[styles.notifCard, !notif.read && styles.unread]} activeOpacity={0.7}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="notifications" size={Responsive.fontSize[24]} color={Colors.primary} />
            </View>
            <View style={styles.notifContent}>
              <Text style={styles.notifTitle}>{notif.title}</Text>
              <Text style={styles.notifMessage}>{notif.message}</Text>
              <Text style={styles.notifTime}>{notif.time}</Text>
            </View>
            {!notif.read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

export default NotificationsScreen

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Responsive.spacing[20], paddingBottom: Responsive.spacing[15], backgroundColor: Colors.primary },
  headerTitle: { fontSize: Responsive.fontSize[20], fontWeight: 'bold', color: Colors.text.inverse },
  content: { flex: 1, paddingHorizontal: Responsive.spacing[20], paddingTop: Responsive.spacing[15] },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.secondary,
    borderRadius: Responsive.radius[12],
    padding: Responsive.padding[15],
    marginBottom: Responsive.spacing[12],
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  unread: {
    backgroundColor: `${Colors.background}`,
    

  },
  iconContainer: { width: Responsive.size.wp(12), height: Responsive.size.wp(12), borderRadius: Responsive.size.wp(6), backgroundColor: `${Colors.primary}20`, justifyContent: 'center', alignItems: 'center', marginRight: Responsive.spacing[12] },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: Responsive.fontSize[15], fontWeight: '600', color: Colors.text.primary, marginBottom: Responsive.spacing[4] },
  notifMessage: { fontSize: Responsive.fontSize[13], color: Colors.text.secondary, marginBottom: Responsive.spacing[6] },
  notifTime: { fontSize: Responsive.fontSize[11], color: Colors.text.disabled },
  unreadDot: { width: Responsive.spacing[8], height: Responsive.spacing[8], borderRadius: Responsive.spacing[4], backgroundColor: Colors.primary },
})
