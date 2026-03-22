import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, ScrollView, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Feather from 'react-native-vector-icons/Feather'
import { Responsive } from '../utilities/Responsive'
import { Colors } from '../utilities/AppTheme'
import { fetchTheaters } from '../redux/slice/moviesSlice'
import { buildShowId } from '../services/movieService'

const TheaterSelectionScreen = () => {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const route = useRoute()
  const dispatch = useDispatch()
  const movie = route.params?.movie
  const movieTitle = movie?.title || route.params?.movieName || 'Movie'
  const movieId = movie?.id || route.params?.movieId || movieTitle
  const [selectedDate, setSelectedDate] = useState(0)
  const [selectedShowTime, setSelectedShowTime] = useState(null)
  const { theatersList, theatersFetchLoading, theatreStatus } = useSelector((state: any) => state.movies)
// console.log('Theatre status',theatreStatus);

  useEffect(() => {
    if (theatreStatus === 'idle') {
      dispatch(fetchTheaters())
      // console.log("fetching theaters")

    }
  }, [theatreStatus, dispatch])

  const getDates = () => {
    const dates = []
    const today = new Date()
    for (let i = 0; i < 5; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
    }
    return dates
  }

  const dates = getDates()
  const theaters = theatersList.length > 0 ? theatersList : [
    { id: 1, name: 'PVR Cinemas', location: 'Downtown Mall', pricePerSeat: 250, showtimes: ['10:00 AM', '1:30 PM', '5:00 PM', '8:30 PM'] },
    { id: 2, name: 'INOX', location: 'City Center', pricePerSeat: 300, showtimes: ['11:00 AM', '2:30 PM', '6:00 PM', '9:30 PM'] },
    { id: 3, name: 'Cinepolis', location: 'Metro Plaza', pricePerSeat: 280, showtimes: ['12:00 PM', '3:30 PM', '7:00 PM', '10:30 PM'] },
  ]

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={[styles.header, { paddingTop: insets.top + Responsive.spacing[15] }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={Responsive.fontSize[24]} color={Colors.text.inverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Theater</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle}>{movieTitle}</Text>
      </View>

      {/* <View style={styles.dateContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {dates.map((date, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.dateCard, selectedDate === index && styles.selectedDate]}
              onPress={() => setSelectedDate(index)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dateText, selectedDate === index && styles.selectedDateText]}>{date}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View> */}

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {theatersFetchLoading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: Responsive.spacing[40] }} />
        ) : (
          theaters.map((theater) => (
            <View key={theater.id} style={styles.theaterCard}>
              <View style={styles.theaterInfo}>
                <View style={styles.theaterHeader}>
                  <Text style={styles.theaterName}>{theater.name}</Text>
                  <Text style={styles.priceTag}>₹{theater.pricePerSeat}/seat</Text>
                </View>
                <View style={styles.locationRow}>
                  <MaterialIcons name="location-on" size={Responsive.fontSize[16]} color={Colors.text.secondary} />
                  <Text style={styles.locationText}>{theater.location}</Text>
                </View>
              </View>
              <View style={styles.showtimesContainer}>
                {theater.showtimes.map((time, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.showtimeButton, selectedShowTime === time && styles.selectedShowtimeButton]}
                    onPress={() => {
                      setSelectedShowTime(time);
                      const selectedDateValue = route.params?.date || dates[selectedDate]
                      const showId = buildShowId({
                        movieId,
                        movieTitle,
                        theater: theater.name,
                        date: selectedDateValue,
                        time,
                      })
                      if (route.params?.returnToChat) {
                        navigation.navigate('Book', {
                          selectedTheater: theater.name,
                          selectedTime: time,
                          selectedShowId: showId,
                        })
                      } else {
                        navigation.navigate('SeatSelection' as never, {
                          movie,
                          theater: { name: theater.name, location: theater.location, pricePerSeat: theater.pricePerSeat },
                          time,
                          date: selectedDateValue,
                          showId,
                        })
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.showtimeText}>{time}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))
        )}
        <View style={{ height: insets.bottom + Responsive.spacing[20] }} />
      </ScrollView>
    </View>
  )
}

export default TheaterSelectionScreen

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
    paddingHorizontal: Responsive.spacing[20],
    paddingVertical: Responsive.spacing[15],
    backgroundColor: Colors.surface,
  },
  movieTitle: {
    fontSize: Responsive.fontSize[18],
    fontWeight: '600',
    color: Colors.text.primary,
  },
  dateContainer: {
    paddingVertical: Responsive.spacing[15],
    paddingLeft: Responsive.spacing[20],
  },
  dateCard: {
    paddingHorizontal: Responsive.padding[20],
    paddingVertical: Responsive.padding[12],
    marginRight: Responsive.spacing[10],
    borderRadius: Responsive.radius[12],
    backgroundColor: Colors.background,
  },
  selectedDate: {
    backgroundColor: Colors.primary,
  },
  dateText: {
    fontSize: Responsive.fontSize[14],
    color: Colors.text.primary,
    fontWeight: '500',
  },
  selectedDateText: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: Responsive.spacing[20],
  },
  theaterCard: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.radius[12],
    padding: Responsive.padding[15],
    marginBottom: Responsive.spacing[15],
    elevation: 2,
    shadowColor: Colors.border.default,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  theaterInfo: {
    marginBottom: Responsive.spacing[12],
  },
  theaterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Responsive.spacing[6],
  },
  theaterName: {
    fontSize: Responsive.fontSize[16],
    fontWeight: '600',
    color: Colors.text.primary,
  },
  priceTag: {
    fontSize: Responsive.fontSize[14],
    fontWeight: '600',
    color: Colors.primary,
    backgroundColor: Colors.border.default,
    paddingHorizontal: Responsive.padding[10],
    paddingVertical: Responsive.padding[4],
    borderRadius: Responsive.radius[6],
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: Responsive.fontSize[13],
    color: Colors.text.secondary,
    marginLeft: Responsive.spacing[4],
  },
  showtimesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  showtimeButton: {
    paddingHorizontal: Responsive.padding[15],
    paddingVertical: Responsive.padding[8],
    borderRadius: Responsive.radius[8],
    borderWidth: 1,
    borderColor: Colors.primary,
    marginRight: Responsive.spacing[10],
    marginBottom: Responsive.spacing[8],
  },
  showtimeText: {
    fontSize: Responsive.fontSize[13],
    color: Colors.border.default,
    fontWeight: '500',
  },
  selectedShowtimeButton: {
    backgroundColor: Colors.background,
    borderColor: Colors.border.default,

  },
})
