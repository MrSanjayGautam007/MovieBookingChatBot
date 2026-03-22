import React, { useEffect, useMemo, useState } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, ScrollView, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Feather from 'react-native-vector-icons/Feather'
import { Responsive } from '../utilities/Responsive'
import { Colors } from '../utilities/AppTheme'
import { buildShowId, subscribeBookedSeatsForShow } from '../services/movieService'

const SeatSelectionScreen = () => {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const route = useRoute()
  const { movie, movieName, movieId, theater, time, date, showId: routeShowId } = route.params || {}
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [bookedSeats, setBookedSeats] = useState<string[]>([])
  const [loadingSeats, setLoadingSeats] = useState(true)

  const rows = ['A', 'B', 'C', 'D', 'E', 'F']
  const seatsPerRow = 8
  const normalizedTheater = typeof theater === 'string'
    ? { name: theater, pricePerSeat: 250 }
    : (theater || { name: '', pricePerSeat: 250 })
  const pricePerSeat = normalizedTheater?.pricePerSeat || 250
  const resolvedMovieTitle = movie?.title || movieName || 'Movie'
  const resolvedMovieId = movie?.id || movieId || resolvedMovieTitle
  const showId = useMemo(() => {
    if (routeShowId) return routeShowId
    return buildShowId({
      movieId: resolvedMovieId,
      movieTitle: resolvedMovieTitle,
      theater: normalizedTheater?.name,
      date,
      time,
    })
  }, [date, normalizedTheater?.name, resolvedMovieId, resolvedMovieTitle, routeShowId, time])

  useEffect(() => {
    if (!showId) {
      setLoadingSeats(false)
      return
    }
    setLoadingSeats(true)
    const unsubscribe = subscribeBookedSeatsForShow(
      showId,
      (seats) => {
        setBookedSeats(seats)
        setSelectedSeats((prev) => prev.filter((seat) => !seats.includes(seat)))
        setLoadingSeats(false)
      },
      () => {
        setLoadingSeats(false)
      }
    )
    return () => unsubscribe()
  }, [showId])

  const toggleSeat = (seat: string) => {
    if (bookedSeats.includes(seat)) return
    setSelectedSeats((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
    )
  }

  const getSeatStatus = (seat: string) => {
    if (bookedSeats.includes(seat)) return 'booked'
    if (selectedSeats.includes(seat)) return 'selected'
    return 'available'
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={[styles.header, { paddingTop: insets.top + Responsive.spacing[15] }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={Responsive.fontSize[24]} color={Colors.text.inverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Seats</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.movieInfo}>
          <Text style={styles.movieTitle}>{resolvedMovieTitle}</Text>
          <Text style={styles.showInfo}>{normalizedTheater?.name} • {date} • {time}</Text>
        </View>
        {loadingSeats && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={Colors.border.default} />
            <Text style={styles.loadingText}>Loading seat availability...</Text>
          </View>
        )}
        <View style={styles.screen}>
          <Text style={styles.screenText}>SCREEN</Text>
        </View>

        <View style={styles.seatsContainer}>

          {rows.map((row) => (
            <View key={row} style={styles.row}>
              <Text style={styles.rowLabel}>{row}</Text>
              {Array.from({ length: seatsPerRow }, (_, i) => {
                const seat = `${row}${i + 1}`
                const status = getSeatStatus(seat)
                return (
                  <TouchableOpacity
                    key={seat}
                    style={[
                      styles.seat,
                      status === 'booked' && styles.bookedSeat,
                      status === 'selected' && styles.selectedSeat,
                    ]}
                    onPress={() => toggleSeat(seat)}
                    disabled={status === 'booked'}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons
                      name="event-seat"
                      size={Responsive.fontSize[20]}
                      color={
                        status === 'booked'
                          ? Colors.text.disabled
                          : status === 'selected'
                            ? Colors.text.inverse
                            : Colors.text.secondary
                      }
                    />
                  </TouchableOpacity>
                )
              })}
            </View>
          ))}
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: Colors.border.default }]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: Colors.primary }]} />
            <Text style={styles.legendText}>Selected</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: Colors.text.disabled }]} />
            <Text style={styles.legendText}>Booked</Text>
          </View>
        </View>
      </ScrollView>

      {selectedSeats.length > 0 && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + Responsive.spacing[10] }]}>
          <View style={styles.priceInfo}>
            <Text style={styles.seatsText}>{selectedSeats.length} Seat(s)</Text>
            <Text style={styles.priceText}>₹{selectedSeats.length * pricePerSeat}</Text>
          </View>
          <TouchableOpacity
            style={styles.proceedButton}
            onPress={() => {
              const paymentParams = { movie, theater: normalizedTheater, time, date, selectedSeats, total: selectedSeats.length * pricePerSeat }
              console.log('Navigating to Payment with:', paymentParams)
              if (route.params?.returnToChat) {
                navigation.navigate('Book', { selectedSeats, showId })
              } else {
                navigation.navigate('Payment' as never, {
                  ...paymentParams,
                  showId,
                  movieId: resolvedMovieId,
                  movieName: resolvedMovieTitle,
                })
              }
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.proceedText}>
              {route.params?.returnToChat ? 'Confirm Seats' : 'Proceed to Pay'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

export default SeatSelectionScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
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
  movieInfo: {
    padding: Responsive.padding[20],
    backgroundColor: Colors.surface,
  },
  movieTitle: {
    fontSize: Responsive.fontSize[18],
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Responsive.spacing[6],
  },
  showInfo: {
    fontSize: Responsive.fontSize[13],
    color: Colors.text.secondary,
  },
  screen: {
    alignItems: 'center',
    marginVertical: Responsive.spacing[20],
  },
  screenText: {
    fontSize: Responsive.fontSize[12],
    color: Colors.text.secondary,
    paddingHorizontal: Responsive.padding[40],
    paddingVertical: Responsive.padding[8],
    backgroundColor: Colors.border.default,
    borderRadius: Responsive.radius[8],
  },
  seatsContainer: {
    paddingHorizontal: Responsive.spacing[20],
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Responsive.spacing[12],
    alignSelf: 'center',
  },
  loadingText: {
    marginLeft: Responsive.spacing[8],
    color: Colors.border.default,
    fontSize: Responsive.fontSize[12],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Responsive.spacing[10],
  },
  rowLabel: {
    fontSize: Responsive.fontSize[14],
    fontWeight: '600',
    color: Colors.text.primary,
    width: Responsive.spacing[30],
  },
  seat: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.border.default,
    borderRadius: Responsive.radius[6],
    marginHorizontal: Responsive.spacing[2],
  },
  selectedSeat: {
    backgroundColor: Colors.primary,
  },
  bookedSeat: {
    backgroundColor: Colors.text.disabled,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Responsive.spacing[20],
    paddingVertical: Responsive.spacing[20],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendBox: {
    width: Responsive.spacing[20],
    height: Responsive.spacing[20],
    borderRadius: Responsive.radius[4],
    marginRight: Responsive.spacing[8],
  },
  legendText: {
    fontSize: Responsive.fontSize[12],
    color: Colors.text.secondary,
  },
  footer: {
    paddingHorizontal: Responsive.spacing[20],
    paddingTop: Responsive.spacing[15],
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border.default,
  },
  priceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Responsive.spacing[15],
  },
  seatsText: {
    fontSize: Responsive.fontSize[16],
    color: Colors.text.primary,
    fontWeight: '500',
  },
  priceText: {
    fontSize: Responsive.fontSize[18],
    color: Colors.primary,
    fontWeight: '600',
  },
  proceedButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Responsive.padding[15],
    borderRadius: Responsive.radius[12],
    alignItems: 'center',
  },
  proceedText: {
    fontSize: Responsive.fontSize[16],
    fontWeight: '600',
    color: Colors.text.inverse,
  },
})
