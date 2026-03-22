import React from 'react'
import Carousel from 'react-native-reanimated-carousel'
import { Image, Text, View, StyleSheet } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import LinearGradient from 'react-native-linear-gradient'
import { Responsive } from '../utilities/Responsive'
import { Colors } from '../utilities/AppTheme'

interface MovieCarouselProps {
    movies: { title: string; image: string }[]
    autoPlayEnabled: boolean
}
interface Movie {
    title: string;
    image: string;
}
const MovieCarousel = ({ movies = [], autoPlayEnabled }: MovieCarouselProps) => {
    const progress = useSharedValue(0)
    const carouselMovies = movies.slice(0, 5)

    const Dot = ({ index, progress }: { index: number; progress: any }) => {
        const dotStyle = useAnimatedStyle(() => ({
            opacity: Math.round(progress.value) === index ? 1 : 0.3,
            transform: [
                {
                    scale: Math.round(progress.value) === index ? 1.2 : 1,
                },
            ],
        }))
        return <Animated.View style={[styles.dot, dotStyle]} />
    }


    const renderItems = ({ item }: { item: Movie }) => {
        return (
            <View style={styles.slide}>
                <Image source={{ uri: item.image }} style={styles.image}
                    resizeMode='cover'
                />
                <LinearGradient
                    colors={['transparent', 'rgba(0, 0, 0, 1)']}
                    style={styles.overlay}
                >
                    <Text style={styles.title}>{item.title}</Text>
                </LinearGradient>
            </View>
        )
    }
    return (
        <View style={styles.container}>
            <Carousel
                width={Responsive.size.wp(80)}
                height={Responsive.size.hp(30)}
                data={carouselMovies}
                autoPlay={autoPlayEnabled && carouselMovies.length > 1}
                autoPlayInterval={3000}
                loop={carouselMovies.length > 1}
                pagingEnabled
                onProgressChange={(_, absoluteProgress) =>
                    (progress.value = absoluteProgress)
                }
                renderItem={renderItems}

            />

            {/* Dot Indicator */}
            <View style={styles.dots}>
                {carouselMovies.map((_, index) => (
                    <Dot key={index} index={index} progress={progress} />
                ))}
            </View>
        </View>
    )
}
export default MovieCarousel
const styles = StyleSheet.create({
    container: {
        marginVertical: Responsive.spacing[10],
        justifyContent: 'center',
        alignItems: 'center',
    },
    slide: {
        borderRadius: Responsive.radius[16],
        overflow: 'hidden',
        marginHorizontal: Responsive.spacing[12],
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        padding: Responsive.padding[16],
        paddingTop: Responsive.padding[40],
    },
    title: {
        color: Colors.text.inverse,
        fontSize: Responsive.fontSize[16],
        fontWeight: '600',
        textAlign: 'center',
    },
    dots: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: Responsive.spacing[10],
    },
    dot: {
        width: Responsive.spacing[8],
        height: Responsive.spacing[8],
        borderRadius: Responsive.radius[4],
        backgroundColor: Colors.text.primary,
        marginHorizontal: Responsive.spacing[4],

    },
})
