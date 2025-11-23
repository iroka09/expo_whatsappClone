import React from 'react';
import { View, Button, Alert,Text } from 'react-native';
import ExpoNotifications from '@/components/ExpoNotifications'
import Notifee from '@/components/Notifee'


function Screen() {

  return (
    <View className="flex-1 justify-center items-center gap-5">
    <Text>Hello world.</Text>
      {
          <>
          <Notifee />
          <ExpoNotifications />
        </>
      }
    </View>
  );
}

export default Screen