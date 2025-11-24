
import { Alert, Button } from "react-native"
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';


// Handle actions when app is running
notifee.onForegroundEvent(({ type, detail }) => {
  if (type === EventType.ACTION_PRESS) {
    const { pressAction, input, notification } = detail;

    switch (pressAction.id) {
      case 'reply':
        Alert.alert('User replied:', input);
        break;

      case 'mark-read':
        Alert.alert('Marked as read');
        notifee.cancelNotification(notification.id);
        break;

      case 'delete':
        Alert.alert('Message deleted');
        notifee.cancelNotification(notification.id);
        break;

      case 'open-app':
        Alert.alert('User opened the app');
        break;
    }
  }
});


async function sendLocalNotification() {
  // Request permissions (iOS & Android 13+)
  await notifee.requestPermission();

  // Create notification channel
  const channelId = await notifee.createChannel({
    id: 'important',
    name: 'Important Notifications',
    sound: 'mixkit_software_interface_remove',        // your custom sound
    importance: AndroidImportance.HIGH,
    vibration: true,
  });

  // Display the notification
  await notifee.displayNotification({
    id: 'unique-id-001',
    title: 'Message from Sarah',
    subtitle: 'Tap to open',
    body: 'Hello world!',
    android: {
      channelId,
      // --- SMALL ICON (must be native resource) ---
      smallIcon: 'LC', // only the name, no extension
      // --- LARGE ICON from assets ---
      largeIcon: require('@/assets/images/me.jpg'),
      // --- COLOR around the smallIcon (optional) ---
      color: '#00ff00',//green
      // --- Custom sound ---
      sound: 'mixkit_software_interface_remove.wav',
      // --- When tapped, open the app ---
      pressAction: {
        id: 'open-app',
      },
      autoCancel: false,//If false, the notification will persist in the notification panel after being pressed. It will remain there until the user removes it (e.g. swipes away)
      // --- Notification buttons ---
      actions: [
        {
          title: 'Reply',
          pressAction: { id: 'reply' },
          input: true,            // opens input box
        },
        {
          title: 'Mark Read',
          pressAction: { id: 'mark-read' },
        },
        {
          title: 'Delete',
          pressAction: { id: 'delete' },
        },
      ],
    },
  });
}

export default function NotifeeApp() {
  return (
    <Button
      title="Press to Send Local Notifee Notification"
      onPress={async () => {
        await sendLocalNotification();
      }}
    />
  )
}