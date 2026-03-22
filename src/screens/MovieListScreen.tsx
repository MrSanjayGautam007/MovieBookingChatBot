import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, FlatList, Image, TextInput, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Feather from 'react-native-vector-icons/Feather'
import { Responsive } from '../utilities/Responsive'
import { Colors } from '../utilities/AppTheme'
import { useSelector } from 'react-redux';

const MovieCard = ({ item, onPress }: any) => (
  <TouchableOpacity
    style={styles.movieCard}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Image source={{ uri: item.image }} style={styles.movieImage} />
    <View style={styles.ratingBadge}>
      <MaterialIcons name="star" size={Responsive.fontSize[14]} color={Colors.accent} />
      <Text style={styles.ratingText}>{item.rating}</Text>
    </View>
    <View style={styles.movieInfo}>
      <Text style={styles.movieTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.movieGenre} numberOfLines={1}>
        {Array.isArray(item.genre) ? item.genre.join(', ') : item.genre}
      </Text>
    </View>
  </TouchableOpacity>
)

const keyExtractor = (item: any) => item.id?.toString?.() || item.title

const MovieListScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('')
  const { moviesList, movieFetchLoading } = useSelector((state: any) => state.movies);
  const autoFocus = useRoute()?.params?.autoFocus || false;
  const inputRef = useRef<TextInput>(null);
  // Auto-focus search input when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (!autoFocus) return;

      const t = setTimeout(() => {
        inputRef.current?.focus();
      }, 250); // wait for navigation transition

      return () => clearTimeout(t);
    }, [autoFocus])
  );
  // const movies = [
  //   { id: 1, title: 'Avengers', rating: 8.5, genre: 'Action', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZO76u9xvtqEP3l0FC3A0GEY6d2Cg-226l0ZFaP0LsSN1_K0CoUqrm8aPp5IdOkPE1gZS8_A&s=10' },
  //   { id: 2, title: 'Inception', rating: 8.8, genre: 'Sci-Fi', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMPwItPZqQvffIMfCvrQWmoo-CQ1V1uvUutg&s' },
  //   { id: 3, title: 'Interstellar', rating: 8.6, genre: 'Sci-Fi', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRR9gHxWXNMUr3lMJr4W8rWpVh6vwyjriJ6bQ&s' },
  //   { id: 4, title: 'Joker', rating: 8.4, genre: 'Drama', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiNFbcjoIX46OmX2x2G5vScPEAcsmOyZ-Ieg&s' },
  //   { id: 5, title: 'Batman', rating: 7.9, genre: 'Action', image: 'https://compote.slate.com/images/77440fdf-a599-4fd1-90fc-cc619aa7419d.jpg?crop=590%2C885%2Cx0%2Cy0' },
  //   { id: 6, title: 'Oppenheimer', rating: 8.7, genre: 'Biography', image: 'https://admin.itsnicethat.com/images/3CzWUmmXvOtHmdH0J1VNY-f9riA=/254910/format-webp%7Cwidth-1440/4._Oppenheimer.jpg' },
  // ]

  const filteredMovies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return moviesList
    return moviesList.filter((m: any) => m.title?.toLowerCase().includes(query))
  }, [moviesList, searchQuery])

  const renderMovie = ({ item }: any) => (
    <MovieCard
      item={item}
      onPress={() => navigation.navigate('MovieDetails' as never, { movie: item } as never)}
    />
  )

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={[styles.header, { paddingTop: insets.top + Responsive.spacing[15] }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={Responsive.fontSize[24]} color={Colors.text.inverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Browse Movies</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={Responsive.fontSize[22]} color={Colors.border.default} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Search movies..."
            placeholderTextColor={Colors.border.default}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={Responsive.fontSize[20]} color={Colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredMovies}
        renderItem={renderMovie}
        keyExtractor={keyExtractor}
        numColumns={2}
        columnWrapperStyle={styles.movieRow}
        removeClippedSubviews
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={7}
        ListEmptyComponent={
          movieFetchLoading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.emptyText}>Loading movies...</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No movies found</Text>
            </View>
          )
        }
        contentContainerStyle={[styles.movieList, {
          paddingBottom: insets.bottom + Responsive.padding[20]
        }]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

export default MovieListScreen

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
  searchContainer: {
    paddingHorizontal: Responsive.spacing[20],
    paddingVertical: Responsive.spacing[15],
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Responsive.radius[35],
    paddingHorizontal: Responsive.padding[15],
    paddingVertical: Responsive.padding[7],
    borderWidth: 0.5,
    borderColor: Colors.border.default,
  },
  searchInput: {
    flex: 1,
    fontSize: Responsive.fontSize[15],
    color: Colors.border.default,
    marginLeft: Responsive.spacing[10],
  },
  movieList: {
    paddingHorizontal: Responsive.spacing[15],
    paddingBottom: Responsive.spacing[20],
  },
  movieCard: {
    width: '48%',
    margin: Responsive.spacing[5],
    borderRadius: Responsive.radius[12],
    backgroundColor: Colors.surface,
    elevation: 3,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  movieImage: {
    width: '100%',
    height: Responsive.size.hp(25),
    borderTopLeftRadius: Responsive.radius[12],
    borderTopRightRadius: Responsive.radius[12],
  },
  ratingBadge: {
    position: 'absolute',
    top: Responsive.spacing[10],
    right: Responsive.spacing[10],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: Responsive.padding[8],
    paddingVertical: Responsive.padding[4],
    borderRadius: Responsive.radius[8],
  },
  ratingText: {
    fontSize: Responsive.fontSize[12],
    color: Colors.text.inverse,
    marginLeft: Responsive.spacing[4],
    fontWeight: '600',
  },
  movieInfo: {
    padding: Responsive.padding[12],
  },
  movieRow: {
    justifyContent: 'space-between',
  },
  movieTitle: {
    fontSize: Responsive.fontSize[15],
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Responsive.spacing[4],
  },
  movieGenre: {
    fontSize: Responsive.fontSize[12],
    color: Colors.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Responsive.spacing[24],
  },
  emptyText: {
    marginTop: Responsive.spacing[8],
    fontSize: Responsive.fontSize[14],
    color: Colors.text.secondary,
  },
})
