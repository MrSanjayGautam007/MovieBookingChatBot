
import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    StatusBar,
} from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    interpolate,

} from "react-native-reanimated";
import LinearGradient from "react-native-linear-gradient";
import { BlurView } from "@react-native-community/blur";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Responsive } from "../utilities/Responsive";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

const STORAGE_KEY = "ONBOARDING_SEEN";

const slides = [
    {
        title: "Book Movies 🎬",
        subtitle: "Discover and book instantly",
        image: require("../assets/images/MovieDateSeat.png"),
        colors: ["#667eea", "#764ba2"],
    },
    {
        title: "Chat with AI 🤖",
        subtitle: "Just chat to book tickets",
        image: require("../assets/images/MovieRecommended.png"),
        colors: ["#43cea2", "#185a9d"],
    },
    {
        title: "Fast Payments 🔐",
        subtitle: "Secure checkout in seconds",
        image: require("../assets/images/CreditCard.png"),
        colors: ["#ff9966", "#ff5e62"],
    },
];
type OnboardingScreenProps = {
    onFinish?: () => void;
};
const OnboardingScreen = React.memo(({ onFinish }: OnboardingScreenProps) => {

    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const scrollRef = useRef<Animated.ScrollView>(null);

    const scrollX = useSharedValue(0);
    const [index, setIndex] = useState(0);

    const width = useMemo(() => Responsive.size.wp(100), []);
    const height = useMemo(() => Responsive.size.hp(100), []);

    // useEffect(() => {
    //     const timer = setInterval(() => {
    //         setIndex(prevIndex => {
    //             const nextIndex = (prevIndex + 1) % slides.length;
    //             scrollRef.current?.scrollTo({
    //                 x: nextIndex * width,
    //                 animated: true,
    //             });
    //             return nextIndex;
    //         });
    //     }, 3000);

    //     return () => clearInterval(timer);
    // }, [width]);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (e) => {
            scrollX.value = e.contentOffset.x;
        },
    }, []);

    const finishOnboarding = useCallback(async () => {
        await AsyncStorage.setItem(STORAGE_KEY, "true");
        onFinish?.();
    }, [onFinish]);


    const goNext = useCallback(() => {
        if (index < slides.length - 1) {
            scrollRef.current?.scrollTo({
                x: (index + 1) * width,
                animated: true,
            });
        } else {
            finishOnboarding();
        }
    }, [index, width, finishOnboarding]);

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

            {/* Fullscreen Blur */}
            {/* <BlurView
                style={StyleSheet.absoluteFill}
                blurType="dark"
                blurAmount={14}
            /> */}

            {/* Slides */}
            <Animated.ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                onMomentumScrollEnd={useCallback((e) => {
                    const i = Math.round(e.nativeEvent.contentOffset.x / width);
                    setIndex(i);
                }, [width])}


            >
                {slides.map((item, i) => {
                    const imageStyle = useAnimatedStyle(() => {
                        const translateX = interpolate(
                            scrollX.value,
                            [(i - 1) * width, i * width, (i + 1) * width],
                            [-40, 0, 40],
                            'clamp'
                        );
                        return {
                            transform: [{ translateX }, { scale: 1.05 }],
                        };
                    }, [i, width]);

                    return (
                        <View key={i} style={useMemo(() => ({ width, flex: 1 }), [width])}>
                            <LinearGradient
                                colors={item.colors}
                                style={styles.slide}
                            >
                                <Animated.Image
                                    source={item.image}
                                    style={[styles.image, imageStyle]}
                                />

                                <View style={styles.textBlock}>
                                    <Text style={styles.title}>{item.title}</Text>
                                    <Text style={styles.subtitle}>{item.subtitle}</Text>
                                </View>
                            </LinearGradient>
                        </View>
                    );
                })}
            </Animated.ScrollView>

            {/* Dots */}
            <View
                style={[
                    styles.dots,
                    { bottom: insets.bottom + Responsive.spacing[80] },
                ]}
            >
                {slides.map((_, i) => {
                    const dotStyle = useAnimatedStyle(() => {
                        const scale = interpolate(
                            scrollX.value / width,
                            [i - 1, i, i + 1],
                            [1, 1.6, 1],
                            'clamp'
                        );
                        return { transform: [{ scale }] };
                    }, [i, width]);

                    return <Animated.View key={i} style={[styles.dot, dotStyle]} />;
                })}
            </View>

            {/* Controls */}
            <View
                style={[
                    styles.controls,
                    { paddingBottom: insets.bottom + Responsive.spacing[16] },
                ]}
            >
                {index !== slides.length - 1 ? (
                    <>
                        <TouchableOpacity onPress={finishOnboarding}>
                            <Text style={styles.skip}>Skip</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.startBtn} onPress={goNext}>
                            <Text style={styles.startText}>Next</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <TouchableOpacity onPress={finishOnboarding}>
                            <Text style={styles.skip}>Skip</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.startBtn} onPress={finishOnboarding}>
                            <Text style={styles.startText}>Get Started</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
});

export default OnboardingScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bg: {
        position: "absolute",
        width: Responsive.size.wp(100),
        height: Responsive.size.hp(100),
    },
    slide: {
        flex: 1,
        justifyContent: "flex-end",
        padding: Responsive.padding[24],
        paddingBottom: Responsive.spacing[100],
    },
    image: {
        position: "absolute",
        width: Responsive.size.wp(90),
        height: Responsive.size.hp(60),
        resizeMode: "contain",
        right: -Responsive.size.wp(5),
        top: Responsive.size.hp(5),
    },
    textBlock: {
        marginBottom: Responsive.spacing[100],
    },
    title: {
        fontSize: Responsive.fontSize[28],
        fontWeight: "700",
        color: "#fff",
        marginBottom: Responsive.spacing[8],
    },
    subtitle: {
        fontSize: Responsive.fontSize[16],
        color: "rgba(255,255,255,0.9)",
    },
    dots: {
        position: "absolute",
        bottom: Responsive.spacing[110],
        flexDirection: "row",
        alignSelf: "center",
    },
    dot: {
        width: Responsive.spacing[10],
        height: Responsive.spacing[10],
        borderRadius: Responsive.radius[5],
        backgroundColor: "#fff",
        marginHorizontal: Responsive.spacing[6],
    },
    controls: {
        position: "absolute",
        bottom: 10,
        width: "100%",
        paddingHorizontal: Responsive.padding[32],
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    skip: {
        color: "rgba(255,255,255,0.7)",
        fontSize: Responsive.fontSize[16],
    },
    startBtn: {
        backgroundColor: "#fff",
        paddingHorizontal: Responsive.padding[32],
        paddingVertical: Responsive.padding[14],
        borderRadius: Responsive.radius[30],
    },
    startText: {
        fontWeight: "700",
        color: "#000",
    },
});
