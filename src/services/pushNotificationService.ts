import { Linking, PermissionsAndroid, Platform } from 'react-native';
import {
  AuthorizationStatus,
  getInitialNotification,
  getMessaging,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  registerDeviceForRemoteMessages,
  requestPermission,
  getToken,
  type RemoteMessage,
} from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteDoc, doc, getFirestore, serverTimestamp, setDoc } from '@react-native-firebase/firestore';
import notifee, { AndroidImportance, AndroidStyle } from '@notifee/react-native';

const ANDROID_CHANNEL_ID = 'moviechatbot-high-v2';
const ANDROID_CHANNEL_NAME = 'General Notifications';
const DEDUPE_TTL_MS = 2 * 60 * 1000;
const recentMessageKeys = new Map<string, number>();
const APP_DEEPLINK_PREFIX = 'moviechatbot://';
const DEVICE_FCM_TOKEN_STORAGE_KEY = 'device_fcm_token';

const requestAndroidNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android' || Number(Platform.Version) < 33) {
    return true;
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
};

const requestMessagingPermission = async (): Promise<boolean> => {
  const messagingInstance = getMessaging();
  const status = await requestPermission(messagingInstance);
  return (
    status === AuthorizationStatus.AUTHORIZED ||
    status === AuthorizationStatus.PROVISIONAL
  );
};

const ensureAndroidChannel = async (): Promise<string> => {
  if (Platform.OS !== 'android') {
    return ANDROID_CHANNEL_ID;
  }

  return notifee.createChannel({
    id: ANDROID_CHANNEL_ID,
    name: ANDROID_CHANNEL_NAME,
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
    lights: true,
  });
};

const resolveNotificationContent = (remoteMessage: RemoteMessage) => {
  const title =
    remoteMessage.notification?.title ||
    remoteMessage.data?.title;
  const body =
    remoteMessage.notification?.body ||
    remoteMessage.data?.body;

  return { title, body };
};

const resolveNotificationImage = (remoteMessage: RemoteMessage): string | undefined => {
  const fromNotification = remoteMessage.notification?.android?.imageUrl;
  const fromTopLevel = (remoteMessage.notification as any)?.imageUrl;
  const fromData =
    remoteMessage.data?.image ||
    remoteMessage.data?.imageUrl ||
    remoteMessage.data?.image_url;

  return fromNotification || fromTopLevel || fromData || undefined;
};

const getMessageKey = (remoteMessage: RemoteMessage) => {
  if (remoteMessage.messageId) {
    return remoteMessage.messageId;
  }

  const { title, body } = resolveNotificationContent(remoteMessage);
  const sentTime = remoteMessage.sentTime || 0;
  const dataKey = JSON.stringify(remoteMessage.data || {});
  return `${sentTime}:${title || ''}:${body || ''}:${dataKey}`;
};

const isDuplicateMessage = (remoteMessage: RemoteMessage) => {
  const now = Date.now();
  for (const [key, timestamp] of recentMessageKeys.entries()) {
    if (now - timestamp > DEDUPE_TTL_MS) {
      recentMessageKeys.delete(key);
    }
  }

  const messageKey = getMessageKey(remoteMessage);
  const existing = recentMessageKeys.get(messageKey);
  if (existing && now - existing <= DEDUPE_TTL_MS) {
    return true;
  }

  recentMessageKeys.set(messageKey, now);
  return false;
};

type MessageSource = 'foreground' | 'background';

const buildDeepLinkFromData = (data?: Record<string, string>): string | null => {
  if (!data) return null;

  if (data.link) {
    return data.link;
  }

  const screen = (data.screen || '').trim();
  if (!screen) return null;

  const movieId = data.movieId || '';
  const bookingId = data.bookingId || '';

  const screenToPath: Record<string, string> = {
    HomeMain: 'home',
    MovieList: 'movies',
    MovieDetails: movieId ? `movie/${encodeURIComponent(movieId)}` : 'movies',
    Book: 'book',
    ProfileMain: 'profile',
    MyBookings: 'profile/my-bookings',
    Notifications: 'profile/notifications',
    PaymentMethods: 'profile/payment-methods',
    Ticket: bookingId ? `profile/ticket/${encodeURIComponent(bookingId)}` : 'profile/ticket',
  };

  return screenToPath[screen] ? `${APP_DEEPLINK_PREFIX}${screenToPath[screen]}` : null;
};

const navigateFromNotificationData = async (data?: Record<string, string>) => {
  const deepLink = buildDeepLinkFromData(data);
  if (!deepLink) return;

  try {
    await Linking.openURL(deepLink);
  } catch (error) {
    console.log('Failed to open deep link:', deepLink, error);
  }
};

export const displayLocalNotificationFromRemoteMessage = async (
  remoteMessage: RemoteMessage,
  source: MessageSource = 'foreground',
): Promise<void> => {
  if (source === 'background' && remoteMessage?.notification) {
    return;
  }

  if (isDuplicateMessage(remoteMessage)) {
    return;
  }

  const { title, body } = resolveNotificationContent(remoteMessage);
  const imageUrl = resolveNotificationImage(remoteMessage);
  if (!title && !body) {
    return;
  }
  const androidChannelId = await ensureAndroidChannel();

  await notifee.displayNotification({
    id: remoteMessage.messageId || undefined,
    title: title || 'MovieChatBot',
    body: body || '',
    android: {
      channelId: androidChannelId,
      pressAction: { id: 'default' },
      smallIcon: 'ic_launcher',
      largeIcon: imageUrl,
      style: imageUrl
        ? {
          type: AndroidStyle.BIGPICTURE,
          picture: imageUrl,
        }
        : undefined,
    },
  });
};

// export const sendLocalTestNotification = async (): Promise<void> => {
//   const androidChannelId = await ensureAndroidChannel();
//   const now = new Date();
//   const hh = String(now.getHours()).padStart(2, '0');
//   const mm = String(now.getMinutes()).padStart(2, '0');

//   await notifee.displayNotification({
//     id: `local-test-${Date.now()}`,
//     title: 'MovieChatBot Test',
//     body: `Local notification sent at ${hh}:${mm}`,
//     android: {
//       channelId: androidChannelId,
//       pressAction: { id: 'default' },
//       smallIcon: 'ic_launcher',
//     },
//   });
// };

const saveTokenForUser = async (uid: string, token: string): Promise<void> => {
  try {
    const db = getFirestore();
    const platform = Platform.OS;

    // Keep last-known token on user root for backward compatibility.
    await setDoc(
      doc(db, 'users', uid),
      {
        fcmToken: token,
        fcmTokenUpdatedAt: Date.now(),
      },
      { merge: true },
    );

    // Multi-device support: one doc per token.
    await setDoc(
      doc(db, 'users', uid, 'devices', token),
      {
        token,
        platform,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch (error) {
    console.log('Failed to save FCM token:', error);
  }
};

const persistDeviceToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(DEVICE_FCM_TOKEN_STORAGE_KEY, token);
  } catch (error) {
    console.log('Failed to persist device token:', error);
  }
};

const getPersistedDeviceToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(DEVICE_FCM_TOKEN_STORAGE_KEY);
  } catch (error) {
    console.log('Failed to read persisted device token:', error);
    return null;
  }
};

export const cleanupPushTokenForUser = async (uid?: string | null): Promise<void> => {
  if (!uid) return;

  let token = await getPersistedDeviceToken();
  if (!token) {
    try {
      token = await getToken(getMessaging());
    } catch (error) {
      console.log('Failed to get current device token for cleanup:', error);
    }
  }
  if (!token) return;

  try {
    const db = getFirestore();
    await deleteDoc(doc(db, 'users', uid, 'devices', token));
  } catch (error) {
    console.log('Failed to delete device token doc:', error);
  } finally {
    try {
      await AsyncStorage.removeItem(DEVICE_FCM_TOKEN_STORAGE_KEY);
    } catch (error) {
      console.log('Failed to clear persisted device token:', error);
    }
  }
};

type InitPushOptions = {
  uid?: string | null;
};

export const initializePushNotifications = async ({
  uid,
}: InitPushOptions): Promise<() => void> => {
  const messagingInstance = getMessaging();
  const isAndroidGranted = await requestAndroidNotificationPermission();
  if (!isAndroidGranted) {
    console.log('Android notification permission denied.');
    return () => { };
  }

  const isMessagingGranted = await requestMessagingPermission();
  if (!isMessagingGranted) {
    console.log('Messaging permission denied.');
    return () => { };
  }

  await ensureAndroidChannel();
  await registerDeviceForRemoteMessages(messagingInstance);
  const token = await getToken(messagingInstance);
  console.log('FCM token:', token);
  await persistDeviceToken(token);

  if (uid && token) {
    await saveTokenForUser(uid, token);
  }

  const unsubscribeForeground = onMessage(messagingInstance, async remoteMessage => {
    console.log('Foreground push message:', remoteMessage);
    await displayLocalNotificationFromRemoteMessage(remoteMessage, 'foreground');
  });

  const unsubscribeTokenRefresh = onTokenRefresh(messagingInstance, async nextToken => {
    console.log('FCM token refreshed:', nextToken);
    await persistDeviceToken(nextToken);
    if (uid) {
      await saveTokenForUser(uid, nextToken);
    }
  });

  const unsubscribeOpenFromBackground = onNotificationOpenedApp(messagingInstance, remoteMessage => {
    console.log('Notification opened from background:', remoteMessage);
    navigateFromNotificationData(remoteMessage?.data as Record<string, string>);
  });

  const initialNotification = await getInitialNotification(messagingInstance);
  if (initialNotification) {
    console.log('Notification opened from quit state:', initialNotification);
    setTimeout(() => {
      navigateFromNotificationData(initialNotification?.data as Record<string, string>);
    }, 700);
  }

  return () => {
    unsubscribeForeground();
    unsubscribeTokenRefresh();
    unsubscribeOpenFromBackground();
  };
};
