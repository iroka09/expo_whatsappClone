
import { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';




const PUSH_REG_KEY = 'PUSH_NOTIFICATION_REGISTERED_TO_SERVER';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});


async function sendPushNotification(expoPushToken: string) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Original Title',
    body: 'And here is the body!',
    data: { someData: 'goes here' },
  };

  const res = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
  console.log(res)
}

async function sendLocalNotification(expoPushToken: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "You've got mail! 📬",
      body: 'Here is the notification body',
      sound: "mixkit_software_interface_remove.wav",
      data: { data: 'goes here', test: { test1: 'more data' } },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 0,
      channelId: "alert"
    },
  });
}


function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'my_default',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
    await Notifications.setNotificationChannelAsync('alert', {
      name: 'payment_alert',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 150, 250],
      lightColor: '#44231F7C',
      sound: "mixkit_software_interface_remove.wav"
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      handleRegistrationError('Permission not granted to get push token for push notification!');
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError('Project ID not found');
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError('Must use physical device for push notifications');
  }
}

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(
    undefined
  );

  useEffect(() => {

    function initializePushNotifications() {
      registerForPushNotificationsAsync()
        .then(async token => {
          setExpoPushToken(token ?? '')
          AsyncStorage.setItem(PUSH_REG_KEY, 'true'); // persist success
        })
        .catch((error: any) => {
          setExpoPushToken(`${error}`)
          AsyncStorage.removeItem(PUSH_REG_KEY); // allow retry next time
        });
    }

    const unsubscribeNetInfo = NetInfo.addEventListener(async state => {
      if (state.isConnected) {
        const registered = await AsyncStorage.getItem(PUSH_REG_KEY);
        if (registered !== 'true') {
          initializePushNotifications();
        }
      }
    });

    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      unsubscribeNetInfo.remove()
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return (<>
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-around',marginBottom:5 }}>
      <Text>Your Expo push token: {expoPushToken}</Text>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text>Title: {notification && notification.request.content.title} </Text>
        <Text>Body: {notification && notification.request.content.body}</Text>
        <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
      </View>
      {/* <Button
        title="Press to Send Push Notification"
        onPress={async () => {
          await sendPushNotification(expoPushToken);
        }}
      />*/}
      <Button
        title="Press to Send Local Expo-Notification"
        onPress={async () => {
          await sendLocalNotification();
        }}
      />
    </View>
  </>);
}