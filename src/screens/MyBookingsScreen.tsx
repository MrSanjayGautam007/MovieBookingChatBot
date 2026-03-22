import React, { useState, useEffect, useCallback } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, ScrollView, Image, ActivityIndicator, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Feather from 'react-native-vector-icons/Feather'
import { Responsive } from '../utilities/Responsive'
import { Colors } from '../utilities/AppTheme'
import GradientBackground from '../components/GradientBackground'
import { fetchUserBookings, refreshUserBookingsLoading } from '../redux/slice/moviesSlice'

const MyBookingsScreen = () => {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState('present') // 'present' | 'upcoming' | 'past'

  const user = useSelector((state: any) => state.auth.user)
  const uid = user?.uid || null
  const { bookingsList, bookingsFetchLoading, userBookingStatus, userBookingRefreshLoading } = useSelector((state: any) => state.movies)
  // console.log('MyBookingsScreen:', bookingsList, bookingsFetchLoading)
  // console.log('User booking status', userBookingStatus)
  useFocusEffect(
    useCallback(() => {
      if (!uid) return
      if (userBookingStatus === 'idle') {
        dispatch(fetchUserBookings(uid))
        // console.log('Fetching User bookings');

      }
    }, [userBookingStatus, uid, dispatch])
  )

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/')
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  }

  const upcomingBookings = bookingsList.filter((b: any) => {
    const bookingDate = parseDate(b.date)
    const nextDay = new Date(today)
    nextDay.setDate(nextDay.getDate() + 1)
    return bookingDate >= nextDay
  })



  const pastBookings = bookingsList.filter((b: any) => {
    const bookingDate = parseDate(b.date)
    return bookingDate < today
  })

  const presentBookings = bookingsList.filter((b: any) => {
    const bookingDate = parseDate(b.date)
    return bookingDate.toDateString() === today.toDateString()
  })

  const filteredBookings = activeTab === 'present' ? presentBookings : activeTab === 'upcoming' ? upcomingBookings : pastBookings
  const onRefresh = async () => {
    dispatch(refreshUserBookingsLoading(true))
    try {
      await dispatch(fetchUserBookings(user?.uid) as any)
    } catch (error) {
      console.log(error);

    } finally {
      dispatch(refreshUserBookingsLoading(false))
    }

  }
  return (
    <GradientBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={[styles.header, { paddingTop: insets.top + Responsive.spacing[15] }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={Responsive.fontSize[24]} color={Colors.text.inverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'present' && styles.activeTab]}
          onPress={() => setActiveTab('present')}
        >
          <Text style={[styles.tabText, activeTab === 'present' && styles.activeTabText]}>Present</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>Upcoming</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>Past</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={userBookingRefreshLoading}
            onRefresh={onRefresh}
          />
        }


      >
        {bookingsFetchLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : filteredBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="movie" size={Responsive.fontSize[80]} color={Colors.border.default} />
            <Text style={styles.emptyText}>No {activeTab} bookings</Text>
          </View>
        ) : (
          filteredBookings.map((booking) => (
            <TouchableOpacity
              style={styles.bookingCard}
              activeOpacity={0.7}
              key={booking.id}
              onPress={() => navigation.navigate('Ticket', { ...booking })}
            >
              <View style={styles.bookingInfo}>
                <Text style={styles.movieTitle}>{booking.movieTitle}</Text>
                <View style={styles.infoRow}>
                  <MaterialIcons name="location-on" size={Responsive.fontSize[16]} color={Colors.text.secondary} />
                  <Text style={styles.infoText}>{booking.theater}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialIcons name="event" size={Responsive.fontSize[16]} color={Colors.text.secondary} />
                  <Text style={styles.infoText}>{booking.date} • {booking.time}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialIcons name="event-seat" size={Responsive.fontSize[16]} color={Colors.text.secondary} />
                  <Text style={styles.infoText}>Seats: {booking.seats?.join(', ')}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialIcons name="payment" size={Responsive.fontSize[16]} color={Colors.text.secondary} />
                  <Text style={styles.infoText}>₹{booking.totalAmount}</Text>
                </View>
              </View>
              <Feather name="check-circle" size={Responsive.fontSize[20]} color={Colors.status.success} />
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: insets.bottom + Responsive.spacing[20] }} />
      </ScrollView>
    </GradientBackground >
  )
}

export default MyBookingsScreen

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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: Responsive.spacing[20],
    paddingVertical: Responsive.spacing[15],
    backgroundColor: Colors.surface,
  },
  tab: {
    flex: 1,
    paddingVertical: Responsive.padding[10],
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: Colors.border.default,
  },
  activeTab: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: Responsive.fontSize[16],
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: Responsive.spacing[20],
  },
  bookingCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Responsive.radius[12],
    padding: Responsive.padding[12],
    marginTop: Responsive.spacing[15],
    elevation: 3,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  movieImage: {
    width: Responsive.size.wp(20),
    height: Responsive.size.wp(28),
    borderRadius: Responsive.radius[8],
    marginRight: Responsive.spacing[12],
  },
  bookingInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  movieTitle: {
    fontSize: Responsive.fontSize[16],
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Responsive.spacing[8],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Responsive.spacing[4],
  },
  infoText: {
    fontSize: Responsive.fontSize[13],
    color: Colors.text.secondary,
    marginLeft: Responsive.spacing[6],
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Responsive.spacing[80],
  },
  emptyText: {
    fontSize: Responsive.fontSize[16],
    color: Colors.text.secondary,
    marginTop: Responsive.spacing[20],
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Responsive.spacing[80],
  },
})
