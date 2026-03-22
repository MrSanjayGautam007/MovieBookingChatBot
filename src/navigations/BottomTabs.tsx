import React from "react";
import { View, Platform, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/Ionicons";
import { BlurView } from "@react-native-community/blur";
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

import ChatScreen from "../screens/ChatScreen";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Responsive } from "../utilities/Responsive";
import { Colors } from "../utilities/AppTheme";

import ProfileStack from "./ProfileStack";
import HomeStack from "./HomeStack";
import LottieView from "lottie-react-native";

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
    const insets = useSafeAreaInsets();
    return (
        <Tab.Navigator
            detachInactiveScreens={true}
            screenOptions={{

                headerShown: false,
                freezeOnBlur: true,
                animation: 'none',
                sceneStyle: {
                    backgroundColor: Colors.background,
                },
                tabBarShowLabel: true,
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.text.secondary,
                tabBarHideOnKeyboard: true,

                tabBarStyle: {
                    position: "absolute",
                    height: Responsive.size.hp(9) + insets.bottom,
                    paddingBottom: insets.bottom,
                    backgroundColor: "transparent",
                    borderTopWidth: 0,
                    elevation: 0,

                },

                tabBarBackground: () => (
                    <View style={styles.tabBarBgWrapper} pointerEvents="box-none">
                        {/* <BlurView
                            blurType='dark'
                            blurAmount={5}
                            reducedTransparencyFallbackColor="rgba(26,26,26,0.95)"
                            style={styles.blurView}
                            autoUpdate={false}
                        /> */}
                    </View>
                ),

                tabBarLabelStyle: {
                    fontSize: Responsive.fontSize[15],
                    marginTop: Responsive.spacing[4],
                },

            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeStack}
                options={({ route }) => ({
                    tabBarStyle: ((route) => {
                        const routeName = getFocusedRouteNameFromRoute(route) ?? 'HomeMain';
                        if (routeName !== 'HomeMain') {
                            return { display: 'none' };
                        }
                        return {
                            position: "absolute",
                            height: Responsive.size.hp(9) + insets.bottom,
                            paddingBottom: insets.bottom,
                            backgroundColor: "transparent",
                            borderTopWidth: 0,
                            elevation: 0,
                        };
                    })(route),
                    tabBarIcon: ({ focused }) => (
                        <Icon
                            name={focused ? "home" : "home-outline"}
                            size={Responsive.fontSize[24]}
                            color={focused ? Colors.primary : Colors.text.secondary}
                        />
                    ),
                })}
            />

            <Tab.Screen
                name="Book"
                component={ChatScreen}
                options={{
                    tabBarLabel: "Book Now",
                    tabBarStyle: { display: "none" },
                    tabBarIcon: ({ focused }) => (
                        <View style={styles.floatingButton}>
                            <LottieView
                                source={require('../assets/lottie/BotChat.json')}
                                autoPlay
                                loop
                                speed={0.8}
                                resizeMode="cover"
                                style={{
                                    width: Responsive.size.wp(35),
                                    height: Responsive.size.wp(35),


                                }}
                            />
                        </View>
                    ),
                }}
            />

            {/* <Tab.Screen
                name="Bookings"
                component={MyBookingsScreen}
                options={{
                    tabBarLabel: "My Bookings",
                    tabBarIcon: ({ focused }) => (
                        <Icon
                            name={focused ? "ticket" : "ticket-outline"}
                            size={Responsive.fontSize[24]}
                            color={focused ? Colors.primary : Colors.text.secondary}
                        />
                    ),
                }}
            /> */}

            <Tab.Screen
                name="Profile"
                component={ProfileStack}
                options={({ route }) => ({
                    tabBarStyle: ((route) => {
                        const routeName = getFocusedRouteNameFromRoute(route) ?? 'ProfileMain';
                        if (routeName !== 'ProfileMain') {
                            return { display: 'none' };
                        }
                        return {
                            position: "absolute",
                            height: Responsive.size.hp(9) + insets.bottom,
                            paddingBottom: insets.bottom,
                            backgroundColor: "transparent",
                            borderTopWidth: 0,
                            elevation: 0,
                        };
                    })(route),
                    tabBarIcon: ({ focused }) => (
                        <Icon
                            name={focused ? "person" : "person-outline"}
                            size={Responsive.fontSize[24]}
                            color={focused ? Colors.primary : Colors.text.secondary}
                        />
                    ),
                })}
            />
        </Tab.Navigator>
    );
};

export default BottomTabs;
const styles = StyleSheet.create({
    floatingButton: {
        position: "absolute",
        top: -Responsive.size.wp(8),
        width: Responsive.size.wp(16),
        height: Responsive.size.wp(16),
        borderRadius: Responsive.size.wp(8),
        backgroundColor: Colors.primary,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",

        elevation: 5,
        shadowColor: Colors.text.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 14,
    },

    bookIconWrapper: {
        width: Responsive.size.wp(12),
        height: Responsive.size.wp(12),
        borderRadius: Responsive.size.wp(6),
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: `${Colors.primary}1A`,
    },
    bookIconActive: {
        backgroundColor: Colors.primary,
        transform: [{ scale: 1.1 }],
    },
    blurView: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden'
    },
    tabBarBgWrapper: {
        flex: 1,
        backgroundColor: 'rgba(26,26,26,0.92)',
        borderTopLeftRadius: Responsive.radius[50],
        borderTopRightRadius: Responsive.radius[50],
        overflow: "hidden",
        borderWidth: 0,
        borderTopWidth: 0.5,
        borderLeftWidth: 0.5,
        borderRightWidth: 0.5,
        borderColor: Colors.border.default,
    },

});
