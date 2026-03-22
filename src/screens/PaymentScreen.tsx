import React, { useState } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Feather from 'react-native-vector-icons/Feather'
import RazorpayCheckout from 'react-native-razorpay'
import { Responsive } from '../utilities/Responsive'
import { Colors } from '../utilities/AppTheme'
import { saveBooking } from '../redux/slice/moviesSlice'
import { buildShowId, reserveSeatsForShow } from '../services/movieService'
import { Image } from 'react-native'

const PaymentScreen = () => {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const route = useRoute()
  const dispatch = useDispatch()
  const user = useSelector((state: any) => state.auth.user)

  // Handle both direct params and nested bookingDetails
  const params = route.params?.bookingDetails || route.params || {}
  const movie = params.movie || { title: params.movieName, id: params.movieId }
  const theater = params.theater ? (typeof params.theater === 'string' ? { name: params.theater } : params.theater) : null
  const time = params.time || params.selectedTime
  const date = params.date || params.selectedDate
  const selectedSeats = params.selectedSeats || params.seats || []

  const total = params.total || params.totalPrice || 0

  const showId = params.showId || buildShowId({
    movieId: movie?.id,
    movieTitle: movie?.title,
    theater: theater?.name,
    date,
    time,
  })

  const [isProcessing, setIsProcessing] = useState(false)



  const handlePayment = async () => {
    if (!movie || !theater || !selectedSeats || !total) {
      Alert.alert('Error', 'Booking details are missing')
      return
    }

    setIsProcessing(true)

    const options = {
      description: `${movie.title} - ${selectedSeats.length} Seat(s)`,
      image: 'https://razorpay.com/assets/razorpay-logo.svg',
      currency: 'INR',
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: total * 100,
      name: 'MovieChatBot',
      prefill: {
        email: 'test@razorpay.com',
        contact: '9999999999',
        name: 'Test User'
      },
      theme: { color: Colors.primary }
    }

    RazorpayCheckout.open(options)
      .then(async (data: any) => {
        setIsProcessing(true)

        // Save booking to Firebase
        const bookingData = {
          uid: user?.uid,
          movieId: movie.id,
          movieTitle: movie.title,
          theater: theater?.name,
          date,
          time,
          showId,
          seats: selectedSeats,
          totalAmount: total,
          transactionId: data.razorpay_payment_id,
          paymentMethod: 'razorpay'
        }

        try {
          await reserveSeatsForShow({
            showId,
            seats: selectedSeats,
            bookingMeta: {
              uid: user?.uid || null,
              paymentId: data.razorpay_payment_id,
              movieId: movie.id,
              theater: theater?.name,
              date,
              time,
            }
          })

          console.log('Attempting to save booking:', bookingData)
          const booking = await dispatch(saveBooking(bookingData)).unwrap()
          setIsProcessing(false)
          navigation.replace('BookingConfirmation' as never, {
            movie,
            theater,
            time,
            date,
            selectedSeats,
            total,
            ticketId: booking?.ticketId,
            status: 'success',
            paymentId: data.razorpay_payment_id
          })
        } catch (error) {
          setIsProcessing(false)
          const msg = String((error as any)?.message || '')
          if (msg.toLowerCase().includes('already booked')) {
            Alert.alert('Seats Unavailable', msg)
          } else {
            Alert.alert('Error', 'Payment successful but failed to save booking')
          }
        }
      })
      .catch((error: any) => {
        setIsProcessing(false)
        console.log('Razorpay error:', error)
        // Alert.alert(
        //   'Payment Failed',
        //   `${error?.description || 'Unknown error'} (code: ${error?.code || 'n/a'})`
        // )
        navigation.navigate('BookingConfirmation' as never, {
          movie,
          theater,
          time,
          date,
          selectedSeats,
          total,
          status: 'failed'
        })
      })
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={[styles.header, { paddingTop: insets.top + Responsive.spacing[15] }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={Responsive.fontSize[24]} color={Colors.text.inverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: Responsive.spacing[40] }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Movie</Text>
            <Text style={styles.summaryValue}>{movie?.title}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Theater</Text>
            <Text style={styles.summaryValue}>{theater?.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date & Time</Text>
            <Text style={styles.summaryValue}>{date} • {time}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Seats</Text>
            <Text style={styles.summaryValue}>{selectedSeats?.join(', ')}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{total}</Text>
          </View>
        </View>

        <View style={styles.paymentInfo}>
          <Image source={require('../assets/images/RazorPayLogo.png')} style={{ width: Responsive.size.wp(60), height: Responsive.size.hp(14), resizeMode: 'contain' }} />
          <Text style={styles.paymentTitle}>Razorpay Secure Payment</Text>
          <Text style={styles.paymentSubtitle}>Pay using UPI, Cards, Wallets & More</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Responsive.spacing[10] }]}>
        <TouchableOpacity
          style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
          onPress={handlePayment}
          activeOpacity={0.8}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              {/* <MaterialIcons name="hourglass-empty" size={Responsive.fontSize[20]} color={Colors.text.inverse} /> */}
              <ActivityIndicator size="small" color={Colors.text.inverse} />
              <Text style={[styles.payButtonText, { marginLeft: Responsive.spacing[10] }]}>Processing...</Text>
            </>
          ) : (
            <Text style={styles.payButtonText}>Pay ₹{total}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default PaymentScreen

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Responsive.spacing[20],
    paddingBottom: Responsive.spacing[15],
    backgroundColor: Colors.primary,
  },
  headerTitle: { fontSize: Responsive.fontSize[20], fontWeight: 'bold', color: Colors.text.inverse },
  content: { flex: 1, paddingHorizontal: Responsive.spacing[20] },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.radius[12],
    padding: Responsive.padding[20],
    marginTop: Responsive.spacing[20],
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryTitle: { fontSize: Responsive.fontSize[18], fontWeight: '600', color: Colors.text.primary, marginBottom: Responsive.spacing[15] },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Responsive.spacing[10] },
  summaryLabel: { fontSize: Responsive.fontSize[14], color: Colors.text.secondary },
  summaryValue: { fontSize: Responsive.fontSize[14], color: Colors.text.primary, fontWeight: '500' },
  totalRow: { marginTop: Responsive.spacing[10], paddingTop: Responsive.spacing[10], borderTopWidth: 1, borderTopColor: Colors.border.default },
  totalLabel: { fontSize: Responsive.fontSize[16], fontWeight: '600', color: Colors.text.primary },
  totalValue: { fontSize: Responsive.fontSize[18], fontWeight: 'bold', color: Colors.primary },
  paymentInfo: {
    alignItems: 'center',
    paddingVertical: Responsive.padding[30],
    marginTop: Responsive.spacing[20],
  },
  paymentTitle: {
    fontSize: Responsive.fontSize[18],
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: Responsive.spacing[15],
  },
  paymentSubtitle: {
    fontSize: Responsive.fontSize[13],
    color: Colors.text.secondary,
    marginTop: Responsive.spacing[6],
  },
  footer: { paddingHorizontal: Responsive.spacing[20], paddingTop: Responsive.spacing[15], backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border.default },
  payButton: { backgroundColor: Colors.primary, paddingVertical: Responsive.padding[15], borderRadius: Responsive.radius[12], alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  payButtonDisabled: { backgroundColor: Colors.text.disabled },
  payButtonText: { fontSize: Responsive.fontSize[16], fontWeight: '600', color: Colors.text.inverse },
})
