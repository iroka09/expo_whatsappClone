
import { lazy } from 'react';
import { View, Button, Alert, Text } from 'react-native';
import ExpoNotifications from '@/components/ExpoNotifications'
const Notifee = lazy(() => import('@/components/Notifee'))


function App() {
  return (
    <View className="flex-1 justify-center items-center gap-5">
      {
        __DEV__ ?
          <>
            <ExpoNotifications />
          </>
          :
          <>
            <ExpoNotifications />
            <Notifee />
          </>
      }
    </View>
  );
}

export default App