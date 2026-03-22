import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, StatusBar } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { Responsive } from '../utilities/Responsive'
import { Colors } from '../utilities/AppTheme'
import LottieView from 'lottie-react-native'

const BookingConfirmationScreen = () => {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const route = useRoute()
  const { movie, theater, time, date, selectedSeats, total, status = 'success', ticketId } = route.params || {}

  const isSuccess = status === 'success'

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor={isSuccess ? Colors.status.success : Colors.status.error} />

      <View style={styles.successIcon}>
        {/* <MaterialIcons
          name={isSuccess ? "check-circle" : "error"}
          size={Responsive.fontSize[100]}
          color={isSuccess ? Colors.status.success : Colors.status.error}
        /> */}
        {
          isSuccess ? (
            <LottieView
              source={require('../assets/lottie/paymentsuccess.json')}
              autoPlay
              loop={false}
              style={styles.successLottie}
            />
          ) : (
            <LottieView
              source={require('../assets/lottie/paymentfailed.json')}
              autoPlay
              loop={false}
              style={{ width: Responsive.size.wp(40), height: Responsive.size.wp(40) }}
            />
          )
        }

      </View>

      <Text style={styles.title}>{isSuccess ? 'Booking Confirmed!' : 'Payment Failed'}</Text>
      <Text style={styles.subtitle}>
        {isSuccess
          ? 'Your tickets have been booked successfully'
          : 'Unable to process payment. Please try again'}
      </Text>

      {isSuccess ? (
        <>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Movie</Text>
              <Text style={styles.value}>{movie?.title}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Theater</Text>
              <Text style={styles.value}>{theater?.name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Date & Time</Text>
              <Text style={styles.value}>{date} | {time}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Seats</Text>
              <Text style={styles.value}>{selectedSeats?.join(', ')}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Amount Paid</Text>
              <Text style={[styles.value, styles.amount]}>₹{total}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.ticketButton}
            onPress={() => navigation.navigate('Ticket' as never, { ticketId, movie, theater, time, date, selectedSeats, total })}
            activeOpacity={0.8}
          >
            <Text style={styles.ticketButtonText}>View Ticket</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => navigation.replace('HomeMain' as never)}
            activeOpacity={0.8}
          >
            <Text style={styles.homeButtonText}>Go to Home</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => navigation.replace('HomeMain' as never)}
            activeOpacity={0.8}
          >
            <Text style={styles.homeButtonText}>Go to Home</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  )
}

export default BookingConfirmationScreen

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Responsive.spacing[20] },
  successIcon: { marginBottom: Responsive.spacing[20] },
  title: { fontSize: Responsive.fontSize[28], fontWeight: 'bold', color: Colors.text.primary, marginBottom: Responsive.spacing[10] },
  subtitle: { fontSize: Responsive.fontSize[14], color: Colors.text.secondary, textAlign: 'center', marginBottom: Responsive.spacing[30] },
  detailsCard: { width: '100%', backgroundColor: Colors.surface, borderRadius: Responsive.radius[12], padding: Responsive.padding[20], elevation: 3, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, marginBottom: Responsive.spacing[30] },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Responsive.spacing[12] },
  label: { fontSize: Responsive.fontSize[14], color: Colors.text.secondary },
  value: { fontSize: Responsive.fontSize[14], color: Colors.text.primary, fontWeight: '500' },
  amount: { color: Colors.primary, fontWeight: '600', fontSize: Responsive.fontSize[16] },
  ticketButton: { width: '100%', backgroundColor: Colors.primary, paddingVertical: Responsive.padding[15], borderRadius: Responsive.radius[12], alignItems: 'center', marginBottom: Responsive.spacing[15] },
  ticketButtonText: { fontSize: Responsive.fontSize[16], fontWeight: '600', color: Colors.text.inverse },
  retryButton: { width: '100%', backgroundColor: Colors.status.error, paddingVertical: Responsive.padding[15], borderRadius: Responsive.radius[12], alignItems: 'center', marginBottom: Responsive.spacing[15] },
  retryButtonText: { fontSize: Responsive.fontSize[16], fontWeight: '600', color: Colors.text.inverse },
  homeButton: { width: '100%', paddingVertical: Responsive.padding[15], borderRadius: Responsive.radius[12], alignItems: 'center', borderWidth: 1, borderColor: Colors.primary },
  homeButtonText: { fontSize: Responsive.fontSize[16], fontWeight: '600', color: Colors.primary },
  successLottie: { width: Responsive.size.wp(45), height: Responsive.size.wp(45) },
})
