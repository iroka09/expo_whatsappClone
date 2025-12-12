import { Alert } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';

notifee.onForegroundEvent(({ type, detail }) => {
  if (type === EventType.ACTION_PRESS) {
    const { pressAction, input, notification } = detail;
    const id = pressAction.id;

    switch (id) {
      case 'play-video':
        Alert.alert('Play pressed');
        break;
      case 'download-video':
        Alert.alert('Download pressed');
        break;
      case 'reply-video':
      case 'reply':
        Alert.alert(input || 'No input'); // reply input
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
        Alert.alert('Main notification tapped');
        break;
    }
  }
});