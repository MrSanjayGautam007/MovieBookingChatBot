import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNav from './src/AppRootNav/RootNav';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useDispatch, useSelector } from 'react-redux';
import NetInfo from "@react-native-community/netinfo";
import { listenToAuthChanges } from './src/firebase/authlistner';
import { connectionChange } from './src/redux/slice/networkSlice';
import { getFirestore, collection, addDoc } from '@react-native-firebase/firestore';
import { cleanupPushTokenForUser, initializePushNotifications } from './src/services/pushNotificationService';

import { getApp } from '@react-native-firebase/app';
import { initializeAppCheck, ReactNativeFirebaseAppCheckProvider } from '@react-native-firebase/app-check';
import ScreenWrapper from './src/components/ScreenWrapper';
import { logger } from './src/utilities/logger';

const App = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.auth.user);
  const previousUidRef = useRef<string | null>(null);

  // const movies = [
  //   {
  //     id: "mv_0213WH01",
  //     title: "Wuthering Heights",
  //     rating: 8.4,
  //     genre: ["Gothic", "Romance", "Drama"], // Array format
  //     duration: "2h 15m",
  //     language: "English",
  //     releaseDate: "2026-02-13",
  //     description: "Margot Robbie and Jacob Elordi star in Emerald Fennell's dark, gothic reimagining of the classic Brontë tale.",
  //     cast: ["Margot Robbie", "Jacob Elordi"],
  //     image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvagQj3DLA4vFog27oTUkAoo4M8-E8S6UI5w&s"
  //   },
  //   {
  //     id: "mv_0213CR02",
  //     title: "Crime 101",
  //     rating: 7.9,
  //     genre: ["Crime", "Thriller"],
  //     duration: "2h 10m",
  //     language: "English",
  //     releaseDate: "2026-02-13",
  //     description: "A master jewel thief (Hemsworth) is pursued by a relentless detective (Ruffalo) in a high-stakes heist across LA.",
  //     cast: ["Chris Hemsworth", "Mark Ruffalo", "Halle Berry"],
  //     image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYfCU6ceN8n4V6F1snTT4V6dXRCp0pjuLI2g&s"
  //   },
  //   {
  //     id: "mv_0213GT03",
  //     title: "GOAT",
  //     rating: 7.2,
  //     genre: ["Animation", "Sports", "Comedy"],
  //     duration: "1h 38m",
  //     language: "English",
  //     releaseDate: "2026-02-13",
  //     description: "A small goat with big dreams enters the world of professional 'roarball' in this Sony Animation underdog story.",
  //     cast: ["Caleb McLaughlin", "David Tennant"],
  //     image: "https://m.media-amazon.com/images/M/MV5BZmFiZWM5YzgtNzQ0MC00MjBjLWI0ODktYjU4MDJmNGUxZWQ3XkEyXkFqcGc@._V1_.jpg"
  //   },
  //   {
  //     id: "mv_0213GL04",
  //     title: "Good Luck, Have Fun, Don't Die",
  //     rating: 8.1,
  //     genre: ["Sci-Fi", "Action", "Comedy"],
  //     duration: "1h 55m",
  //     language: "English",
  //     releaseDate: "2026-02-13",
  //     description: "A man from the future arrives in a modern-day diner to recruit a team of losers to save the world from rogue AI.",
  //     cast: ["Sam Rockwell", "Haley Lu Richardson"],
  //     image: "https://m.media-amazon.com/images/M/MV5BOTQ0NzYzM2QtOWYzMC00MGU5LWJmMTQtYTU1ODU0ZjUwYjk0XkEyXkFqcGc@._V1_.jpg"
  //   },
  //   {
  //     id: "mv_0117WM05",
  //     title: "Wolf Man",
  //     rating: 7.4,
  //     genre: ["Horror", "Thriller"],
  //     duration: "1h 52m",
  //     language: "English",
  //     releaseDate: "2026-01-17",
  //     description: "A man must protect his family from a lethal predator during a full moon in the remote wilderness.",
  //     cast: ["Christopher Abbott", "Julia Garner"],
  //     image: "https://m.media-amazon.com/images/M/MV5BNDNhNmE5MTYtZjc4OC00YWM0LTgzMmEtMTRiMDYzMjZhMjJlXkEyXkFqcGc@._V1_.jpg"
  //   },
  //   {
  //     id: "mv_0418MK06",
  //     title: "Mickey 17",
  //     rating: 8.3,
  //     genre: ["Sci-Fi", "Adventure", "Drama"],
  //     duration: "2h 19m",
  //     language: "English",
  //     releaseDate: "2025-04-18",
  //     description: "An 'expendable' clone on an ice-world colonization mission refuses to let his replacement take over.",
  //     cast: ["Robert Pattinson", "Steven Yeun"],
  //     image: "https://m.media-amazon.com/images/M/MV5BZGQwYmEzMzktYzBmMy00NmVmLTkyYTUtOTYyZjliZDNhZGVkXkEyXkFqcGc@._V1_.jpg"
  //   },
  //   {
  //     id: "mv_0213CS07",
  //     title: "Cold Storage",
  //     rating: 6.8,
  //     genre: ["Horror", "Comedy", "Sci-Fi"],
  //     duration: "1h 50m",
  //     language: "English",
  //     releaseDate: "2026-02-13",
  //     description: "Storage facility workers realize their workplace is sitting on top of an ancient alien fungal outbreak.",
  //     cast: ["Joe Keery", "Liam Neeson"],
  //     image: "https://m.media-amazon.com/images/M/MV5BOWFlZmZiNWMtY2U4Mi00ZGY1LTgzZTItMTkxZjczNjAyNGI0XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg"
  //   },
  //   {
  //     id: "mv_1219AV08",
  //     title: "Avatar: Fire and Ash",
  //     rating: 8.8,
  //     genre: ["Sci-Fi", "Action", "Adventure"],
  //     duration: "3h 10m",
  //     language: "English",
  //     releaseDate: "2025-12-19",
  //     description: "The Sully family faces a new threat from the 'Ash People', a volcanic tribe of Na'vi.",
  //     cast: ["Sam Worthington", "Zoe Saldana"],
  //     image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQgwG4oWDpB_0Xq3fi_MH1eYtdVz01VKaGxww&s"
  //   },
  //   {
  //     id: "mv_0110DT09",
  //     title: "Den of Thieves 2: Pantera",
  //     rating: 7.1,
  //     genre: ["Action", "Crime", "Thriller"],
  //     duration: "2h 25m",
  //     language: "English",
  //     releaseDate: "2025-01-10",
  //     description: "Big Nick is back on the hunt in Europe, closing in on a massive diamond heist network.",
  //     cast: ["Gerard Butler", "O'Shea Jackson Jr."],
  //     image: "https://m.media-amazon.com/images/M/MV5BZGIyYTI5N2QtZmQ5ZC00NDE4LThhYWMtNGE5NjI1OGU2M2NjXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg"
  //   },
  //   {
  //     id: "mv_0711SM10",
  //     title: "Superman",
  //     rating: 8.9,
  //     genre: ["Action", "Sci-Fi", "Superhero"],
  //     duration: "2h 45m",
  //     language: "English",
  //     releaseDate: "2025-07-11",
  //     description: "A new era begins as Superman tries to reconcile his Kryptonian heritage with his human upbringing.",
  //     cast: ["David Corenswet", "Rachel Brosnahan"],
  //     image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzspwrj-xvnFmZrVezA-XzI097B0vo6hOHjA&s"
  //   },
  //   {
  //     id: "mv_0213OR11",
  //     title: "O Romeo",
  //     rating: 8.2,
  //     genre: ["Action", "Thriller", "Romance"],
  //     duration: "2h 45m",
  //     language: "Hindi",
  //     releaseDate: "2026-02-13",
  //     description: "Shahid Kapoor channels a rugged, rowdy lover in Vishal Bhardwaj's gritty reimagining of the romantic tragedy.",
  //     cast: ["Shahid Kapoor", "Triptii Dimri", "Nana Patekar"],
  //     image: "https://m.media-amazon.com/images/M/MV5BOTg3MWI0MjEtM2U0My00ZWI4LWJmMjktOWRlZjRlNGI2MjUyXkEyXkFqcGc@._V1_.jpg"
  //   },
  //   {
  //     id: "mv_0213TM12",
  //     title: "Tu Yaa Main",
  //     rating: 7.4,
  //     genre: ["Romance", "Thriller", "Survival"],
  //     duration: "2h 18m",
  //     language: "Hindi",
  //     releaseDate: "2026-02-13",
  //     description: "Two social media-obsessed youngsters face a deadly fight for survival in a crocodile-infested swamp.",
  //     cast: ["Shanaya Kapoor", "Adarsh Gourav"],
  //     image: "https://m.media-amazon.com/images/M/MV5BZTI0NmU5MTItY2RjNC00MzRiLThkMzEtNGFhMTAxZDU1MDdiXkEyXkFqcGc@._V1_.jpg"
  //   },
  //   {
  //     id: "mv_0213SY13",
  //     title: "Swayambhu",
  //     rating: 8.5,
  //     genre: ["Historical", "Action", "Epic"],
  //     duration: "2h 50m",
  //     language: "Telugu/Hindi",
  //     releaseDate: "2026-02-13",
  //     description: "An epic saga following a legendary warrior tasked with restoring balance to a crumbling empire.",
  //     cast: ["Nikhil Siddhartha", "Nabha Natesh"],
  //     image: "https://m.media-amazon.com/images/M/MV5BMmFlZWZlOTAtNjAyMC00NDBkLThkMjMtNDUwZGEwMzc3NDFmXkEyXkFqcGc@._V1_.jpg"
  //   },
  //   {
  //     id: "mv_0206VD14",
  //     title: "Vadh 2",
  //     rating: 8.0,
  //     genre: ["Crime", "Drama", "Thriller"],
  //     duration: "2h 10m",
  //     language: "Hindi",
  //     releaseDate: "2026-02-06",
  //     description: "Sanjay Mishra and Neena Gupta return in this spiritual sequel exploring dark justice and heavy secrets.",
  //     cast: ["Sanjay Mishra", "Neena Gupta"],
  //     image: "https://m.media-amazon.com/images/M/MV5BODBjYWQxN2QtZTYwNC00YWJmLTliZTUtYmJmY2QxNzliNjEyXkEyXkFqcGc@._V1_.jpg"
  //   },
  //   {
  //     id: "mv_0206BH15",
  //     title: "Bhabiji Ghar Par Hain! Fun on the Run",
  //     rating: 6.5,
  //     genre: ["Comedy", "Adventure"],
  //     duration: "2h 15m",
  //     language: "Hindi",
  //     releaseDate: "2026-02-06",
  //     description: "The beloved TV characters hit the big screen in a chaotic, laughter-filled cross-country adventure.",
  //     cast: ["Aasif Sheikh", "Shubhangi Atre"],
  //     image: "https://m.media-amazon.com/images/M/MV5BYjJiZDcwMDUtOTc0Ni00ZjI0LTg2ZDEtYzdiZjFhNDZhZGMwXkEyXkFqcGc@._V1_.jpg"
  //   },
  //   {
  //     id: "mv_0123BR16",
  //     title: "Border 2",
  //     rating: 8.7,
  //     genre: ["War", "Action", "Drama"],
  //     duration: "3h 15m",
  //     language: "Hindi",
  //     releaseDate: "2026-01-23",
  //     description: "Sunny Deol returns to lead a new generation of soldiers in a massive retelling of Indian military bravery.",
  //     cast: ["Sunny Deol", "Varun Dhawan", "Diljit Dosanjh"],
  //     image: "https://m.media-amazon.com/images/M/MV5BMTUxZjgwNTItMjQ5Yy00NGU4LTlhMGYtY2ZiN2Y2ZmQ1MTRiXkEyXkFqcGc@._V1_.jpg"
  //   },
  //   {
  //     id: "mv_0213SP17",
  //     title: "Seetha Payanam",
  //     rating: 7.2,
  //     genre: ["Drama", "Family"],
  //     duration: "2h 25m",
  //     language: "Tamil/Telugu",
  //     releaseDate: "2026-02-13",
  //     description: "A heartwarming journey of a woman rediscovering her family's roots across rural landscapes.",
  //     cast: ["Aditi Rao Hydari", "Naveen Chandra"],
  //     image: "https://m.media-amazon.com/images/M/MV5BZDlmYTNlZTYtOWI1OS00MDI0LWE2ZjAtZDAwZWUwMWVhMzQ3XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg"
  //   },
  //   {
  //     id: "mv_0116HP18",
  //     title: "Happy Patel: Khatarnak Jasoos",
  //     rating: 6.9,
  //     genre: ["Comedy", "Spy", "Action"],
  //     duration: "2h 15m",
  //     language: "Hindi",
  //     releaseDate: "2026-01-16",
  //     description: "A bumbling spy finds himself in the middle of a global conspiracy while visiting his village in India.",
  //     cast: ["Vir Das", "Mona Singh"],
  //     image: "https://m.media-amazon.com/images/M/MV5BOWUyZTBjYTctMGQyNS00Mjg0LTg5ZTMtZDA1YmEyZDIxZjRlXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg"
  //   },
  //   {
  //     id: "mv_1010TX19",
  //     title: "Toxic",
  //     rating: 8.8,
  //     genre: ["Action", "Crime", "Drama"],
  //     duration: "2h 45m",
  //     language: "Kannada/Hindi",
  //     releaseDate: "2025-10-10",
  //     description: "A dark period-piece gangster thriller following the rise of a brutal kingpin in the drug underworld.",
  //     cast: ["Yash", "Nayanthara"],
  //     image: "https://m.media-amazon.com/images/M/MV5BMDZiNzAwZTQtYWIwMC00ODA0LWJiOGMtZTgzZGYzYzMxMDNiXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg"
  //   },
  //   {
  //     id: "mv_1101SA20",
  //     title: "Singham Again",
  //     rating: 7.6,
  //     genre: ["Action", "Crime"],
  //     duration: "2h 55m",
  //     language: "Hindi",
  //     releaseDate: "2024-11-01",
  //     description: "The biggest crossover in the Rohit Shetty Cop Universe as all forces join to stop a global terror threat.",
  //     cast: ["Ajay Devgn", "Deepika Padukone", "Akshay Kumar"],
  //     image: "https://m.media-amazon.com/images/M/MV5BYTUyN2I4YWQtZjVkNi00MTY1LThjNjAtYjhkZTI2MWU1YzUxXkEyXkFqcGc@._V1_.jpg"
  //   }
  // ];
  // const theatres = [
  //   { id: 1, name: 'PVR Cinemas', location: 'Downtown Mall', pricePerSeat: 250, showtimes: ['10:00 AM', '1:30 PM', '5:00 PM', '8:30 PM'] },
  //   { id: 2, name: 'INOX', location: 'City Center', pricePerSeat: 300, showtimes: ['11:00 AM', '2:30 PM', '6:00 PM', '9:30 PM'] },
  //   { id: 3, name: 'Cinepolis', location: 'Metro Plaza', pricePerSeat: 280, showtimes: ['12:00 PM', '3:30 PM', '7:00 PM', '10:30 PM'] },
  // ]

  const seedTemporaryMovies = async () => {
    const db = getFirestore();
    try {
      const movieCollection = collection(db, 'movies');
      // We use Promise.all to fire all 10 requests at once
      await Promise.all(movies.map(movie => addDoc(movieCollection, movie)));
      logger.log("All movies added to Firestore!");
    } catch (error) {
      logger.error("Error seeding movies: ", error);
    }
  };

  //  useEffect(() => {
  //     const init = async () => {
  //       try {
  //         const app = getApp();
  //         const provider = new ReactNativeFirebaseAppCheckProvider();

  //         provider.configure({
  //           android: {
  //             provider: __DEV__ ? 'debug' : 'playIntegrity',
  //           },
  //         });

  //         await initializeAppCheck(app, {
  //           provider,
  //           isTokenAutoRefreshEnabled: true,
  //         });

  //         logger.log("🚀 App Check Ready!");
  //       } catch (e) {
  //         logger.error("App Check Setup Error:", e);
  //       }
  //     };

  //     init();
  //   }, []);

  useEffect(() => {
    const unsubscribe = listenToAuthChanges(dispatch);
    return unsubscribe;
  }, []);
  useEffect(() => {
    // 1. Start the listener
    const unsubscribe = NetInfo.addEventListener(state => {
      dispatch(connectionChange({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type,
      }));
    });
    // seedTemporaryMovies()

    return () => unsubscribe(); // 2. Clean up
  }, [dispatch]);

  useEffect(() => {


    let cleanupNotifications = () => { };
    let isDisposed = false;
    const previousUid = previousUidRef.current;
    const currentUid = user?.uid || null;
    previousUidRef.current = currentUid;

    if (previousUid && previousUid !== currentUid) {
      cleanupPushTokenForUser(previousUid).catch((error) => {
        logger.log('Push token cleanup error:', error);
      });
    }

    const setupPush = async () => {
      const cleanup = await initializePushNotifications({
        uid: currentUid,
      });

      if (isDisposed) {
        cleanup();
        return;
      }

      cleanupNotifications = cleanup;
    };

    setupPush();

    return () => {
      isDisposed = true;
      cleanupNotifications();
    };
  }, [user?.uid]);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <ScreenWrapper>

            <RootNav />
          </ScreenWrapper>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );

}

export default App

const styles = StyleSheet.create({})
