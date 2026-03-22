import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import HomeScreen from '../screens/HomeScreen'
import MovieListScreen from '../screens/MovieListScreen'
import MovieDetailsScreen from '../screens/MovieDetailsScreen'
import TheaterSelectionScreen from '../screens/TheaterSelectionScreen'
import SeatSelectionScreen from '../screens/SeatSelectionScreen'
import PaymentScreen from '../screens/PaymentScreen'
import BookingConfirmationScreen from '../screens/BookingConfirmationScreen'
import TicketScreen from '../screens/TicketScreen'


const Stack = createNativeStackNavigator()

const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade_from_bottom',
        presentation: 'card',
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="MovieList" component={MovieListScreen} />
      <Stack.Screen name="MovieDetails" component={MovieDetailsScreen} />
      <Stack.Screen name="TheaterSelection" component={TheaterSelectionScreen} />
      <Stack.Screen name="SeatSelection" component={SeatSelectionScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
      <Stack.Screen name="Ticket" component={TicketScreen} />
    </Stack.Navigator>
  )
}

export default HomeStack
