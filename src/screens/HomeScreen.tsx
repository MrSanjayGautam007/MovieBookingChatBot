import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  FlatList,
  Image,
  TextInput,
  RefreshControl,
  BackHandler,
  ToastAndroid,
  Platform,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect, useNavigation, useIsFocused } from '@react-navigation/native'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Feather from 'react-native-vector-icons/Feather'
import { TrueSheet } from '@lodev09/react-native-true-sheet'
import { Responsive } from '../utilities/Responsive'
import { Colors } from '../utilities/AppTheme'
import MovieCarousel from '../components/MovieCarousel'
import LinearGradient from 'react-native-linear-gradient'
import { useDispatch, useSelector } from 'react-redux';
import { fetchMovies } from '../redux/slice/moviesSlice'
import LottieView from 'lottie-react-native'
import HomeSkeletonLoader from '../components/HomeSkeletonLoader'
import { sendLocalTestNotification } from '../services/pushNotificationService'
import { logger } from '../utilities/logger'
interface Feature {
  id: number
  title: string
  subtitle: string
  icon: string
  color: string
  screen?: string
}

const PROMOS = [
  { id: '1', title: '50% OFF on Weekdays', subtitle: 'Book now and save big!', color: '#FF6B6B' },
  { id: '2', title: 'Buy 1 Get 1 Free', subtitle: 'Valid on select movies', color: '#4ECDC4' },
  { id: '3', title: 'Student Discount', subtitle: '25% off with valid ID', color: '#45B7D1' },
]

const COMING_SOON = [
  { id: '11', title: 'Deadpool 3', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOeEmUhnq5JNTHhGlg8g60IZVqNDn_msDTXw&s', releaseDate: 'Jul 26, 2024', genre: 'Action' },
  { id: '12', title: 'Dune Part 2', image: 'https://mir-s3-cdn-cf.behance.net/project_modules/1400/bae27228199851.55cb82652ffe3.jpg', releaseDate: 'Mar 15, 2024', genre: 'Sci-Fi' },
  { id: '13', title: 'Gladiator 2', image: 'https://rukminim2.flixcart.com/image/480/640/jnamvm80/poster/h/w/r/large-stranger-things-season-2-poster-a3-13-x-19-inches-original-imafay3m5fddv8pg.jpeg?q=90', releaseDate: 'Nov 22, 2024', genre: 'Action' },
  { id: '14', title: 'Avatar 3', image: 'https://preview.redd.it/what-has-happened-to-movie-posters-v0-veyma8wnnhb81.jpg?width=640&crop=smart&auto=webp&s=3155408077eb1f8e3f8c4566b44e51204bc09ba9', releaseDate: 'Dec 20, 2024', genre: 'Sci-Fi' },
]

const CITIES = ['Bhilwara', 'Delhi', 'Jaipur', 'Lucknow', 'Noida']

const FEATURES: Feature[] = [
  {
    id: 1,
    title: 'Chat Assistant',
    subtitle: 'Get help with bookings',
    icon: 'chat',
    color: '#FF6B6B',
    screen: 'Book',
  },
  {
    id: 2,
    title: 'Browse Movies',
    subtitle: 'Discover new films',
    icon: 'movie',
    color: '#4ECDC4',
    screen: 'MovieList',
  },
]

const HomeScreen = () => {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<any>()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('All')
  const [selectedCity, setSelectedCity] = useState('Bhilwara')
  const [refreshing, setRefreshing] = useState(false)
  const backPressedOnce = useRef(false);
  const exitTimeoutRef = useRef(null)
  const locationSheetRef = useRef<TrueSheet>(null)
  const isLocationSheetOpen = useRef(false)
  const isFocused = useIsFocused()

  const dispatch = useDispatch();
  const { moviesList, movieFetchLoading, movieStatus } = useSelector((state: any) => state.movies);
  // logger.log('Movie list', moviesList);
  // logger.log('movie status', movieStatus)
  const presentLocationSheet = useCallback(() => {
    requestAnimationFrame(async () => {
      isLocationSheetOpen.current = true
      await locationSheetRef.current?.present()
    })
  }, [])

  const dismissLocationSheet = useCallback(async () => {
    if (!isLocationSheetOpen.current) return
    isLocationSheetOpen.current = false
    await locationSheetRef.current?.dismiss()
  }, [])

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return;

      const onBackPress = () => {
        // User is on Home screen ONLY (because of useFocusEffect)
        if (isLocationSheetOpen.current) {
          dismissLocationSheet()
          return true
        }

        if (backPressedOnce.current) {
          BackHandler.exitApp();
          return true;
        }

        backPressedOnce.current = true;
        ToastAndroid.show(
          'Press back again to exit',
          ToastAndroid.LONG
        );

        exitTimeoutRef.current = setTimeout(() => {
          backPressedOnce.current = false;
        }, 2000);

        return true;
      };

      //  Correct modern API
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      return () => {
        if (exitTimeoutRef.current) {
          clearTimeout(exitTimeoutRef.current);
          exitTimeoutRef.current = null;
        }
        subscription.remove();
      };
    }, [dismissLocationSheet])
  );
  useEffect(() => {
    if (movieStatus === 'idle') {
      dispatch(fetchMovies());
      // logger.log('Fetching movies');

    }

  }, [movieStatus, dispatch]);

  const onRefresh = async () => {
    try {
      setRefreshing(true)

      await dispatch(fetchMovies())

    } finally {
      setRefreshing(false)
    }
  }

  const genres = useMemo(() => ['All', ...new Set(moviesList.flatMap(m => m.genre || []))], [moviesList]);

  // const movies = [
  //   { id: '1', title: 'Avengers', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZO76u9xvtqEP3l0FC3A0GEY6d2Cg-226l0ZFaP0LsSN1_K0CoUqrm8aPp5IdOkPE1gZS8_A&s=10', rating: 8.4, genre: 'Action' },
  //   { id: '2', title: 'Inception', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMPwItPZqQvffIMfCvrQWmoo-CQ1V1uvUutg&s', rating: 8.8, genre: 'Sci-Fi' },
  //   { id: '3', title: 'Interstellar', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRR9gHxWXNMUr3lMJr4W8rWpVh6vwyjriJ6bQ&s', rating: 8.6, genre: 'Sci-Fi' },
  //   { id: '4', title: 'Joker', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiNFbcjoIX46OmX2x2G5vScPEAcsmOyZ-Ieg&s', rating: 8.5, genre: 'Drama' },
  //   { id: '5', title: 'Batman', image: 'https://compote.slate.com/images/77440fdf-a599-4fd1-90fc-cc619aa7419d.jpg?crop=590%2C885%2Cx0%2Cy0', rating: 7.9, genre: 'Action' },
  //   { id: '6', title: 'Oppenheimer', image: 'https://admin.itsnicethat.com/images/3CzWUmmXvOtHmdH0J1VNY-f9riA=/254910/format-webp%7Cwidth-1440/4._Oppenheimer.jpg', rating: 8.7, genre: 'Drama' },
  // ]

  const filteredMovies = useMemo(() => moviesList.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase())

    // Check if 'All' is selected, OR if the movie's genre array contains the selected genre
    const matchesGenre = selectedGenre === 'All' ||
      (Array.isArray(movie.genre) && movie.genre.includes(selectedGenre))

    return matchesSearch && matchesGenre
  }), [moviesList, searchQuery, selectedGenre])

  const showCarousel = searchQuery.length <= 0 && moviesList.length > 0 && selectedGenre === 'All';

  const handleFeaturePress = (feature: Feature) => {
    if (feature.screen) {
      navigation.navigate(feature.screen as never)
    }
  }

  // const handleTestNotification = async () => {
  //   try {
  //     await sendLocalTestNotification()
  //     if (Platform.OS === 'android') {
  //       ToastAndroid.show('Test notification sent', ToastAndroid.SHORT)
  //     }
  //   } catch (error) {
  //     logger.log('Test notification failed:', error)
  //     if (Platform.OS === 'android') {
  //       ToastAndroid.show('Failed to send test notification', ToastAndroid.SHORT)
  //     }
  //   }
  // }

  const renderPromo = ({ item }: any) => (
    <LinearGradient
      colors={[item.color, `${item.color}CC`]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.promoBanner}
    >
      <MaterialIcons name="local-offer" size={Responsive.fontSize[24]} color="#fff" />
      <View style={styles.promoContent}>
        <Text style={styles.promoTitle}>{item.title}</Text>
        <Text style={styles.promoSubtitle}>{item.subtitle}</Text>
      </View>
    </LinearGradient>
  )

  const renderGenreChip = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.genreChip, selectedGenre === item && styles.genreChipActive]}
      onPress={() => setSelectedGenre(item)}
      activeOpacity={0.7}
    >
      <Text style={[styles.genreText, selectedGenre === item && styles.genreTextActive]}>{item}</Text>
    </TouchableOpacity>
  )

  const renderMovieCard = useCallback(({ item }: any) => (
    <TouchableOpacity
      style={styles.movieCard}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('MovieDetails', { movie: item })}
    >
      <Image source={{ uri: item.image }} style={styles.moviePoster} />
      <View style={styles.ratingBadge}>
        <MaterialIcons name="star" size={Responsive.fontSize[14]} color="#FFD700" />
        <Text style={styles.ratingText}>{item.rating}</Text>
      </View>
      <View style={styles.movieOverlay}>
        <Text style={styles.movieTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.movieGenre}>{item.genre}</Text>
      </View>
    </TouchableOpacity>
  ), [navigation]) // Only re-create if navigation changes

  const renderComingSoon = ({ item }: any) => (
    <TouchableOpacity
      style={styles.comingSoonCard}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('MovieDetails', { movieId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.comingSoonPoster} />
      <View style={styles.comingSoonOverlay}>
        <Text style={styles.comingSoonTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.releaseDate}>{item.releaseDate}</Text>
      </View>
    </TouchableOpacity>
  )

  if (movieFetchLoading) {
    return <HomeSkeletonLoader />
  }

  return (
    <LinearGradient
      colors={Colors.gradient.cinema}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor={'transparent'} />

      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + Responsive.spacing[5],
          },
        ]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.locationSelector} activeOpacity={0.7} onPress={presentLocationSheet}>
            <MaterialIcons name="location-on" size={Responsive.fontSize[20]} color={Colors.primary} />
            <Text style={styles.cityText}>{selectedCity}</Text>
            <Feather name="chevron-down" size={Responsive.fontSize[16]} color={Colors.text.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>MovieBot</Text>
        </View>
        <TouchableOpacity style={styles.botAvatar} onPress={() => navigation.navigate('Book' as never)} activeOpacity={0.7}>
          {/* <Image
            source={require('../assets/images/BotHowAreYou.png')}
            style={styles.botAvatar}
            resizeMode='contain'
          /> */}
          <LottieView
            source={require('../assets/lottie/chatbot.json')}
            autoPlay
            loop
            style={styles.botAvatarLottie}
          />
          {/* <LottieView
            source={require('../assets/lottie/testbot.json')}
            autoPlay
            loop
            style={styles.botAvatarLottie}
          /> */}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.searchContainer]}
        onPress={() => {
          navigation.navigate('MovieList', { autoFocus: true } as never)
        }}
      >
        <Feather name="search" size={Responsive.fontSize[20]} color={Colors.text.primary} />
        {/* <TextInput
          style={styles.searchInput}
          placeholder="Search movies..."
          placeholderTextColor={Colors.text.secondary}
          value={searchQuery}
          // onChangeText={setSearchQuery}
          onFocus={() => {
            navigation.navigate('MovieList', { autoFocus: true })
          }}
        /> */}
        <Text style={styles.searchInput}>Search movies...</Text>
        {/* {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialIcons name="close" size={Responsive.fontSize[20]} color={Colors.text.secondary} />
          </TouchableOpacity>
        )} */}
      </TouchableOpacity>

      {/* Main Content */}
      <View style={[styles.content]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          scrollEventThrottle={16}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          contentContainerStyle={{
            paddingBottom: insets.bottom + Responsive.spacing[100]
          }}
        >
          {/* Promotional Banners */}
          <FlatList
            data={PROMOS}
            horizontal
            keyExtractor={(item) => item.id}
            renderItem={renderPromo}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.promoBanners}
            removeClippedSubviews
          />

          {/* Genre Filters */}
          <FlatList
            data={genres}
            horizontal
            keyExtractor={(item) => item.toString()}
            renderItem={renderGenreChip}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.genreFilters}
            removeClippedSubviews
          />
          {/* Now Showing Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎬 Featured Movies</Text>

          </View>

          {/* Featured Movie Carousel */}
          {
            showCarousel && (
              <MovieCarousel movies={moviesList} autoPlayEnabled={isFocused} />)
          }


          {/* Movie Poster Grid */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎬 Now Showing</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MovieList')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {filteredMovies.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="movie-filter" size={Responsive.fontSize[64]} color={Colors.text.secondary} />
              <Text style={styles.emptyText}>No movies found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
            </View>
          ) : (
            <FlatList
              data={filteredMovies}
              numColumns={2}
              keyExtractor={(item) => item.id?.toString?.() || item.title}
              renderItem={renderMovieCard}
              scrollEnabled={false}
              removeClippedSubviews
              initialNumToRender={6}
              maxToRenderPerBatch={8}
              windowSize={5}
              columnWrapperStyle={styles.movieRow}
            />
          )}

          {/* Coming Soon Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔜 Coming Soon</Text>
          </View>

          <FlatList
            data={COMING_SOON}
            horizontal
            keyExtractor={(item) => item.id}
            renderItem={renderComingSoon}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.comingSoonList}
            removeClippedSubviews
          />

          {/* Quick Actions */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          </View>

          <View style={styles.quickActions}>
            {FEATURES.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.actionCard}
                onPress={() => handleFeaturePress(item)}
                activeOpacity={0.8}
              >
                <View style={[styles.actionIcon, { backgroundColor: item.color }]}>
                  <MaterialIcons name={item.icon} size={Responsive.fontSize[24]} color="#fff" />
                </View>
                <Text style={styles.actionTitle}>{item.title}</Text>
              </TouchableOpacity>
            ))
            }
            {/* <TouchableOpacity
              style={styles.actionCard}
              onPress={handleTestNotification}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#6C63FF' }]}>
                <MaterialIcons name="notifications-active" size={Responsive.fontSize[24]} color="#fff" />
              </View>
              <Text style={styles.actionTitle}>Test Notification</Text>
            </TouchableOpacity> */}
          </View>
        </ScrollView>
      </View>
      <TrueSheet
        ref={locationSheetRef}
        detents={['auto']}
        backgroundBlur="dark"
        // draggable={false}
        blurOptions={{
          intensity: 15,
          interaction: false,
        }}
        backgroundColor={Colors.background}
        cornerRadius={Responsive.radius[24]}
        accessibilityViewIsModal={true}
      >
        <View style={styles.locationSheetContainer}>
          <Text style={styles.locationSheetTitle}>Select City</Text>
          {CITIES.map((city) => (
            <TouchableOpacity
              key={city}
              style={styles.locationOption}
              onPress={async () => {
                setSelectedCity(city)
                await dismissLocationSheet()
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.locationOptionText, selectedCity === city && styles.locationOptionTextActive]}>{city}</Text>
              {selectedCity === city ? (
                <MaterialIcons name="check-circle" size={Responsive.fontSize[20]} color={Colors.primary} />
              ) : null}
            </TouchableOpacity>
          ))}
          {/* <TouchableOpacity style={styles.locationOption} onPress={dismissLocationSheet} activeOpacity={0.8}>
            <Text style={styles.locationOptionText}>Cancel</Text>
            <MaterialIcons name="close" size={Responsive.fontSize[20]} color={Colors.text.secondary} />
          </TouchableOpacity> */}
        </View>
      </TrueSheet>
    </LinearGradient >
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Responsive.spacing[20],
    // paddingBottom: Responsive.spacing[20],
  },
  headerContent: {
    flex: 1,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Responsive.spacing[8],
  },
  cityText: {
    fontSize: Responsive.fontSize[14],
    color: Colors.text.primary,
    fontWeight: '600',
    marginLeft: Responsive.spacing[4],
    marginRight: Responsive.spacing[2],
  },
  headerTitle: {
    fontSize: Responsive.fontSize[28],
    fontWeight: 'bold',
    color: Colors.primary,
    letterSpacing: 1,
  },
  searchContainer: {

    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Responsive.radius[25],
    paddingHorizontal: Responsive.padding[15],
    paddingVertical: Responsive.padding[12],
    marginHorizontal: Responsive.spacing[20],
    marginBottom: Responsive.spacing[15],
    borderWidth: 0.5,
    borderColor: Colors.border.default,
  },
  searchInput: {
    flex: 1,
    fontSize: Responsive.fontSize[16],
    color: Colors.text.primary,
    marginLeft: Responsive.spacing[10],
  },
  botAvatar: {
    width: Responsive.size.wp(30),
    height: Responsive.size.wp(28),
    justifyContent: 'center',
    alignItems: 'center',

  },
  content: {
    flex: 1,
    paddingHorizontal: Responsive.spacing[20],
  },
  promoBanners: {
    marginBottom: Responsive.spacing[15],
  },
  promoBanner: {
    width: Responsive.size.wp(70),
    height: Responsive.size.hp(8),
    borderRadius: Responsive.radius[12],
    marginRight: Responsive.spacing[15],
    padding: Responsive.padding[15],
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoContent: {
    marginLeft: Responsive.spacing[12],
    flex: 1,
  },
  promoTitle: {
    fontSize: Responsive.fontSize[16],
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: Responsive.spacing[4],
  },
  promoSubtitle: {
    fontSize: Responsive.fontSize[12],
    color: '#fff',
    opacity: 0.9,
  },
  genreFilters: {
    marginBottom: Responsive.spacing[20],
  },
  genreChip: {
    paddingHorizontal: Responsive.padding[20],
    paddingVertical: Responsive.padding[10],
    borderRadius: Responsive.radius[20],
    backgroundColor: Colors.surface,
    marginRight: Responsive.spacing[10],
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  genreChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  genreText: {
    fontSize: Responsive.fontSize[14],
    color: Colors.text.primary,
    fontWeight: '600',
  },
  genreTextActive: {
    color: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Responsive.spacing[5],
    marginBottom: Responsive.spacing[5],
  },
  sectionTitle: {
    fontSize: Responsive.fontSize[20],
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  seeAll: {
    fontSize: Responsive.fontSize[14],
    color: Colors.primary,
    fontWeight: '600',
  },
  movieGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  movieRow: {
    justifyContent: 'space-between',
  },
  movieCard: {
    width: '48%',
    height: Responsive.size.hp(28),
    marginBottom: Responsive.spacing[15],
    borderRadius: Responsive.radius[12],
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    elevation: 5,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  moviePoster: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: Responsive.spacing[8],
    right: Responsive.spacing[8],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: Responsive.padding[8],
    paddingVertical: Responsive.padding[4],
    borderRadius: Responsive.radius[12],
  },
  ratingText: {
    fontSize: Responsive.fontSize[12],
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: Responsive.spacing[4],
  },
  movieOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: Responsive.padding[10],
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  movieTitle: {
    fontSize: Responsive.fontSize[14],
    fontWeight: '600',
    color: Colors.text.primary,
  },
  movieGenre: {
    fontSize: Responsive.fontSize[11],
    color: Colors.text.secondary,
    marginTop: Responsive.spacing[2],
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Responsive.spacing[40],
  },
  emptyText: {
    fontSize: Responsive.fontSize[18],
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: Responsive.spacing[15],
  },
  emptySubtext: {
    fontSize: Responsive.fontSize[14],
    color: Colors.text.secondary,
    marginTop: Responsive.spacing[5],
  },
  comingSoonList: {
    marginBottom: Responsive.spacing[20],
  },
  comingSoonCard: {
    width: Responsive.size.wp(40),
    height: Responsive.size.hp(30),
    marginRight: Responsive.spacing[15],
    borderRadius: Responsive.radius[12],
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  comingSoonPoster: {
    width: '100%',
    height: '100%',
  },
  comingSoonOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: Responsive.padding[12],
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  comingSoonTitle: {
    fontSize: Responsive.fontSize[14],
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Responsive.spacing[4],
  },
  releaseDate: {
    fontSize: Responsive.fontSize[11],
    color: Colors.accent,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: Responsive.radius[12],
    padding: Responsive.padding[15],
    marginBottom: Responsive.spacing[15],
    alignItems: 'center',
    elevation: 5,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionIcon: {
    width: Responsive.size.wp(14),
    height: Responsive.size.wp(14),
    borderRadius: Responsive.size.wp(7),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Responsive.spacing[10],
  },
  actionTitle: {
    fontSize: Responsive.fontSize[14],
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Responsive.radius[15],
    padding: Responsive.padding[15],
    marginBottom: Responsive.spacing[15],
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featureIcon: {
    width: Responsive.size.wp(12),
    height: Responsive.size.wp(12),
    borderRadius: Responsive.size.wp(6),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Responsive.spacing[15],
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: Responsive.fontSize[18],
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Responsive.spacing[4],
  },
  featureSubtitle: {
    fontSize: Responsive.fontSize[14],
    color: Colors.text.secondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Responsive.spacing[20],
    marginBottom: Responsive.spacing[20],
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: Colors.border.default,
    borderRadius: Responsive.radius[15],
    paddingVertical: Responsive.padding[15],
    paddingHorizontal: Responsive.padding[20],
    minWidth: Responsive.size.wp(25),
  },
  statNumber: {
    fontSize: Responsive.fontSize[20],
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Responsive.spacing[4],
  },
  statLabel: {
    fontSize: Responsive.fontSize[12],
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  botAvatarLottie: {
    width: Responsive.size.wp(30),
    height: Responsive.size.wp(28),
  },
  locationSheetContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: Responsive.spacing[24],
    paddingTop: Responsive.spacing[16],
    paddingBottom: Responsive.spacing[30],
  },
  locationSheetTitle: {
    fontSize: Responsive.fontSize[20],
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: Responsive.spacing[16],
    textAlign: 'center',
  },
  locationOption: {
    paddingVertical: Responsive.spacing[12],
    paddingHorizontal: Responsive.spacing[16],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderRadius: Responsive.radius[14],
    marginBottom: Responsive.spacing[10],
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  locationOptionText: {
    fontSize: Responsive.fontSize[16],
    fontWeight: '600',
    color: Colors.text.primary,
  },
  locationOptionTextActive: {
    color: Colors.primary,
  },
})
