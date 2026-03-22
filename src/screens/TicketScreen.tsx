import React, { useRef, useState, useEffect } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, ScrollView, Alert, ActivityIndicator, Platform, ToastAndroid } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Feather from 'react-native-vector-icons/Feather'
import QRCode from 'react-native-qrcode-svg'
import ViewShot from 'react-native-view-shot'
import Share from 'react-native-share'


import { Responsive } from '../utilities/Responsive'
import { Colors } from '../utilities/AppTheme'
import { getBookingByTicketId } from '../services/movieService'

const TicketScreen = () => {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const route = useRoute()
  const user = useSelector((state: any) => state.auth.user)
  const params = route.params || {}
  const {
    movie: initialMovie,
    theater: initialTheater,
    time: initialTime,
    date: initialDate,
    selectedSeats: initialSeats,
    total: initialTotal,
    ticketId: initialTicketId,
  } = params
  // console.log('params', params);

  const [movie, setMovie] = useState(initialMovie)
  const [theater, setTheater] = useState(initialTheater)
  const [time, setTime] = useState(initialTime)
  const [date, setDate] = useState(initialDate)
  const [selectedSeats, setSelectedSeats] = useState(initialSeats)
  const [total, setTotal] = useState(initialTotal)
  const [ticketId, setTicketId] = useState(initialTicketId)
  const viewShotRef = useRef<any>(null)
  const [ticketLoaded, setTicketLoaded] = useState(false)
  useEffect(() => {
    if (!movie && ticketId && user?.uid) {
      // user arrived with only a ticketId (e.g. after restart or deep link)
      (async () => {

        try {
          setTicketLoaded(true)
          const booking = await getBookingByTicketId(ticketId, user.uid)
          if (booking) {
            setMovie({ title: booking.movieTitle })
            setTheater({ name: booking.theater })
            setTime(booking.time)
            setDate(booking.date)
            setSelectedSeats(booking.seats)
            setTotal(booking.totalAmount)
            setTicketId(booking.ticketId)
          }
        } catch (e) {
          console.log('Failed to load booking', e)
        } finally {
          setTicketLoaded(false)
        }
      })()
    }
  }, [movie, ticketId, user?.uid])

  const handleShare = async () => {
    try {
      const uri = await viewShotRef.current.capture()
      await Share.open({
        url: `file://${uri}`,
        title: 'Share Ticket',
        message: `Movie Ticket - ${movie?.title}`,
      })
    } catch (error) {
      console.log('Share error:', error)
    }
  }

  // const handleDownload = async () => {
  //   try {
  //     const uri = await viewShotRef.current.capture()
  //     const fileName = `MovieTicket_${ticketId}_${Date.now()}.png`

  //     // On Android 11+, save to app cache directory (no permission needed)
  //     const cacheDir = `${RNFS.CachesDirectoryPath}/${fileName}`

  //     // Copy captured image to cache directory  
  //     await RNFS.copyFile(uri, cacheDir)

  //     // Now share from cache (which works without storage permission)
  //     await Share.open({
  //       url: `file://${cacheDir}`,
  //       title: 'Save Ticket',
  //       message: 'Save this ticket image to your gallery',
  //     })

  //   } catch (error) {
  //     console.log('Download error:', error)
  //     Alert.alert('Error', 'Failed to save ticket')
  //   }
  // }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={[styles.header, { paddingTop: insets.top + Responsive.spacing[15] }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={Responsive.fontSize[24]} color={Colors.text.inverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Ticket</Text>
        <TouchableOpacity onPress={handleShare}>
          <MaterialIcons name="share" size={Responsive.fontSize[24]} color={Colors.text.inverse} />
        </TouchableOpacity>
      </View>
      {
        ticketLoaded ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size={Responsive.size.wp(10)} color={Colors.primary} />
            <Text style={styles.loadingText}>Loading Ticket...</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content,
          { paddingBottom: insets.bottom + Responsive.spacing[20] }
          ]}
          >
            <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }}>
              <View style={styles.ticketCard}>
                <View style={styles.qrContainer}>
                  {ticketId ? (
                    <QRCode
                      value={ticketId}
                      size={Responsive.size.wp(50)}
                      backgroundColor={Colors.surface}
                      color={Colors.text.primary}
                    />
                  ) : (
                    <View style={styles.qrPlaceholder}>
                      <MaterialIcons name="qr-code-2" size={Responsive.fontSize[120]} color={Colors.text.secondary} />
                    </View>
                  )}
                  <Text style={styles.qrText}>Show this QR code at the theater</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailsSection}>
                  <Text style={styles.movieTitle}>{movie?.title || 'Movie Title'}</Text>

                  <View style={styles.detailRow}>
                    <MaterialIcons name="location-on" size={Responsive.fontSize[20]} color={Colors.text.secondary} />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Theater</Text>
                      <Text style={styles.detailValue}>{theater?.name || 'Theater Name'}</Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <MaterialIcons name="event" size={Responsive.fontSize[20]} color={Colors.text.secondary} />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Date & Time</Text>
                      <Text style={styles.detailValue}>{date} • {time}</Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <MaterialIcons name="event-seat" size={Responsive.fontSize[20]} color={Colors.text.secondary} />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Seats</Text>
                      <Text style={styles.detailValue}>{selectedSeats?.join(', ') || 'N/A'}</Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <MaterialIcons name="payment" size={Responsive.fontSize[20]} color={Colors.text.secondary} />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Total Amount</Text>
                      <Text style={styles.detailValue}>₹{total || 0}</Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <MaterialIcons name="confirmation-number" size={Responsive.fontSize[20]} color={Colors.text.secondary} />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Ticket ID</Text>
                      <Text style={styles.detailValue}>{ticketId || 'N/A'}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </ViewShot>

            <TouchableOpacity style={styles.downloadButton} activeOpacity={0.8} onPress={handleShare}>
              <MaterialIcons name="download" size={Responsive.fontSize[20]} color={Colors.primary} />
              <Text style={styles.downloadText}>Download Ticket</Text>
            </TouchableOpacity>
          </ScrollView>
        )
      }

    </View>
  )
}

export default TicketScreen

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Responsive.spacing[20], paddingBottom: Responsive.spacing[15], backgroundColor: Colors.primary },
  headerTitle: { fontSize: Responsive.fontSize[20], fontWeight: 'bold', color: Colors.text.inverse },
  content: { paddingHorizontal: Responsive.spacing[20], paddingVertical: Responsive.spacing[20] },
  ticketCard: { backgroundColor: Colors.surface, borderRadius: Responsive.radius[16], elevation: 4, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, overflow: 'hidden' },
  qrContainer: { alignItems: 'center', paddingVertical: Responsive.padding[30] },
  qrPlaceholder: { width: Responsive.size.wp(50), height: Responsive.size.wp(50), backgroundColor: Colors.border.default, borderRadius: Responsive.radius[12], justifyContent: 'center', alignItems: 'center', marginBottom: Responsive.spacing[15] },
  qrText: { fontSize: Responsive.fontSize[13], color: Colors.text.secondary },
  divider: { height: 1, backgroundColor: Colors.border.default, marginHorizontal: Responsive.spacing[20] },
  detailsSection: { padding: Responsive.padding[20] },
  movieTitle: { fontSize: Responsive.fontSize[22], fontWeight: 'bold', color: Colors.text.primary, marginBottom: Responsive.spacing[20] },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Responsive.spacing[15] },
  detailContent: { marginLeft: Responsive.spacing[12], flex: 1 },
  detailLabel: { fontSize: Responsive.fontSize[12], color: Colors.text.secondary, marginBottom: Responsive.spacing[4] },
  detailValue: { fontSize: Responsive.fontSize[15], color: Colors.text.primary, fontWeight: '500' },
  downloadButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: Responsive.spacing[20], paddingVertical: Responsive.padding[15], borderRadius: Responsive.radius[12], borderWidth: 1, borderColor: Colors.primary,
    elevation: 2, shadowColor: Colors.text.primary, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2,
    backgroundColor: Colors.surface,

  },

  downloadText: { fontSize: Responsive.fontSize[16], color: Colors.primary, fontWeight: '600', marginLeft: Responsive.spacing[10] },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', backgroundColor: 'transparent' },
  loadingText: { marginTop: Responsive.spacing[15], fontSize: Responsive.fontSize[16], color: Colors.primary, fontWeight: '600' },
})
