import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EditProfileScreen from '../screens/EditProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import DeleteAccountScreen from '../screens/DeleteAccountScreen';
import AboutUsScreen from '../screens/AboutUsScreen';
import TermsConditionsScreen from '../screens/TermsConditionsScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import ContactUsScreen from '../screens/ContactUsScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import TicketScreen from '../screens/TicketScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const ProfileStack = () => {

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'fade_from_bottom',
                presentation: 'card',
            }}
        >
            <Stack.Screen name='ProfileMain' component={ProfileScreen} />
            <Stack.Screen name='EditProfile' component={EditProfileScreen} />
            <Stack.Screen name='Settings' component={SettingsScreen} />
            <Stack.Screen name='HelpSupport' component={HelpSupportScreen} />
            <Stack.Screen name='PaymentMethods' component={PaymentMethodsScreen} />
            <Stack.Screen name='Notifications' component={NotificationsScreen} />
            <Stack.Screen name='ChangePassword' component={ChangePasswordScreen} />
            <Stack.Screen name='DeleteAccount' component={DeleteAccountScreen} />
            <Stack.Screen name='MyBookings' component={MyBookingsScreen} />
            <Stack.Screen name='Ticket' component={TicketScreen} />
            <Stack.Screen name='AboutUs' component={AboutUsScreen} />
            <Stack.Screen name='TermsConditions' component={TermsConditionsScreen} />
            <Stack.Screen name='PrivacyPolicy' component={PrivacyPolicyScreen} />
            <Stack.Screen name='ContactUs' component={ContactUsScreen} />
        </Stack.Navigator>
    )
}

export default ProfileStack

const styles = StyleSheet.create({})
