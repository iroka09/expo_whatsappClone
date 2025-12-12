
import "@/libs/notifee_events"
import { useState, useEffect } from "react"
import { Alert, Button, Text, TextInput, ScrollView, KeyboardAvoidingView } from "react-native"
import notifee, { AndroidImportance, AndroidStyle } from '@notifee/react-native';


async function showBigPictureWithActions() {
  const channelId = await notifee.createChannel({
    id: 'important2',
    name: 'Important Notifications 2',
    sound: 'mixkit_software_interface_remove',        // your custom sound
    importance: AndroidImportance.HIGH,
    vibration: true,
  });

  await notifee.displayNotification({
    title: 'Amani Trending Video',
    body: 'Tap an action below',
    android: {
      channelId,
      smallIcon: 'notification_icon',
      pressAction: { id: 'open-app' },
      style: {
        type: AndroidStyle.BIGPICTURE,
        picture: "amani",
      },
      // largeIcon: "amani",
      // -- ACTION BUTTONS --
      actions: [
        {
          title: 'Play',
          pressAction: { id: 'play-video' },
          // optional icon:
          icon: "play",
        },
        {
          title: 'Download',
          pressAction: { id: 'download-video' },
        },
        {
          title: 'Reply',
          pressAction: { id: 'reply-video' },
          input: { placeholder: "Enter your message..." }
        }
      ],
    },
  });
}


export default function NotifeeApp() {
  return (
    <Button
      title="Display Notifee Notification"
      onPress={async () => {
        await showBigPictureWithActions();
      }}
    />
  )
}