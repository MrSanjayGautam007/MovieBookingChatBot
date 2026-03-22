import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, ScrollView, Image } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Feather from 'react-native-vector-icons/Feather'
import { Responsive } from '../utilities/Responsive'
import { Colors } from '../utilities/AppTheme'

const MovieDetailsScreen = () => {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const route = useRoute()
  // console.log('Route', route.params?.movie);

  const movie = route.params?.movie || {
    title: 'Avengers: Endgame',
    rating: 8.5,
    genre: 'Action, Adventure',
    duration: '3h 1m',
    language: 'English',
    releaseDate: 'April 26, 2019',
    description: 'After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more to reverse Thanos actions and restore balance to the universe.',
    cast: ['Robert Downey Jr.', 'Chris Evans', 'Mark Ruffalo'],
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZO76u9xvtqEP3l0FC3A0GEY6d2Cg-226l0ZFaP0LsSN1_K0CoUqrm8aPp5IdOkPE1gZS8_A&s=10',
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: movie.image }} style={styles.movieImage} />
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.backButton, { top: insets.top + Responsive.spacing[10] }]}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={Responsive.fontSize[24]} color={Colors.text.inverse} />
          </TouchableOpacity>
          <View style={styles.ratingBadge}>
            <MaterialIcons name="star" size={Responsive.fontSize[20]} color={Colors.accent} />
            <Text style={styles.ratingText}>{movie.rating}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{movie.title}</Text>
          <Text style={styles.genre}>{movie.genre}</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <MaterialIcons name="access-time" size={Responsive.fontSize[18]} color={Colors.text.secondary} />
              <Text style={styles.infoText}>{movie.duration}</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name="language" size={Responsive.fontSize[18]} color={Colors.text.secondary} />
              <Text style={styles.infoText}>{movie.language}</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name="event" size={Responsive.fontSize[18]} color={Colors.text.secondary} />
              <Text style={styles.infoText}>{movie.releaseDate}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Synopsis</Text>
            <Text style={styles.description}>{movie.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cast</Text>
            <View style={styles.castContainer}>
              {movie.cast.map((actor, index) => (
                <View key={index} style={styles.castItem}>
                  <MaterialIcons name="person" size={Responsive.fontSize[40]} color={Colors.border.default} />
                  <Text style={styles.castName}>{actor}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Responsive.spacing[10] }]}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => navigation.navigate('Book' as never, { movieId: movie.id || '1', movieName: movie.title } as never)}
          activeOpacity={0.8}
        >
          <Text style={styles.bookButtonText}>Book with MovieBot</Text>
          <Image
            source={require('../assets/images/BotChat.png')}
            style={{ width: Responsive.spacing[30], height: Responsive.spacing[30], }}
            resizeMode='contain'

          />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default MovieDetailsScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  imageContainer: {
    position: 'relative',
  },
  movieImage: {
    width: '100%',
    height: Responsive.size.hp(50),
  },
  backButton: {
    position: 'absolute',
    left: Responsive.spacing[20],
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: Responsive.padding[10],
    borderRadius: Responsive.radius[20],
  },
  ratingBadge: {
    position: 'absolute',
    top: Responsive.spacing[20],
    right: Responsive.spacing[20],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: Responsive.padding[12],
    paddingVertical: Responsive.padding[8],
    borderRadius: Responsive.radius[12],
  },
  ratingText: {
    fontSize: Responsive.fontSize[16],
    color: Colors.text.inverse,
    marginLeft: Responsive.spacing[6],
    fontWeight: '600',
  },
  content: {
    padding: Responsive.padding[20],
  },
  title: {
    fontSize: Responsive.fontSize[26],
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Responsive.spacing[8],
  },
  genre: {
    fontSize: Responsive.fontSize[14],
    color: Colors.text.secondary,
    marginBottom: Responsive.spacing[20],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Responsive.spacing[25],
  },
  infoItem: {
    alignItems: 'center',
  },
  infoText: {
    fontSize: Responsive.fontSize[12],
    color: Colors.text.secondary,
    marginTop: Responsive.spacing[6],
  },
  section: {
    marginBottom: Responsive.spacing[25],
  },
  sectionTitle: {
    fontSize: Responsive.fontSize[18],
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Responsive.spacing[12],
  },
  description: {
    fontSize: Responsive.fontSize[14],
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  castContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  castItem: {
    alignItems: 'center',
    marginRight: Responsive.spacing[20],
    marginBottom: Responsive.spacing[15],
  },
  castName: {
    fontSize: Responsive.fontSize[12],
    color: Colors.text.primary,
    marginTop: Responsive.spacing[6],
  },
  footer: {
    paddingHorizontal: Responsive.spacing[20],
    paddingTop: Responsive.spacing[15],
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border.default,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Responsive.padding[15],
    borderRadius: Responsive.radius[12],
  },
  bookButtonText: {
    fontSize: Responsive.fontSize[16],
    fontWeight: '600',
    color: Colors.text.inverse,
    marginRight: Responsive.spacing[10],
  },
})
