
import { useEffect, useState } from 'react';
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/redux/store";
import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Text, Image, useColorScheme } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import PortalProvider from "@/components/Portal"
import * as NavigationBar from 'expo-navigation-bar';
import "../global.css"





function Splash() {
  const colorScheme = useColorScheme()
  useEffect(() => {
    const isDark = colorScheme === 'dark';
    NavigationBar.setBackgroundColorAsync(isDark ? '#ff0000' : '#ffffff')
    NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark')
  }, [colorScheme])
  return (
    <SafeAreaProvider >
      <SafeAreaView className="flex-1 bg-theme dark:bg-theme-dark items-center justify-center">
        <View className="flex-1 items-center justify-center">
          <View>
            <Image source={require("../assets/images/whatsapp_iconGreen.png")} style={{
              width: 100, height: 105, objectFit: "contain", marginHorizontal: "auto"
            }} />
            <Text className="text-3xl font-bold text-green-600 dark:text-white">
              WhatsApp
            </Text>
          </View>
        </View>
        <Text className="text-md font-bold text-light-primary dark:text-white italic w-[50%] text-center">
          From Tochi
        </Text>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}


function Layout() {
  return (
    <ReduxProvider store={store} >
      <GestureHandlerRootView>
        <PortalProvider>
          <SafeAreaProvider >
            <SafeAreaView className="flex-1 bg-theme dark:bg-theme-dark">
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: "slide_from_right",
                  animationTypeForReplace: "push",
                  gestureEnabled: true,
                }}
              >
                <Stack.Screen
                  name="(main)"
                  options={{
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="contacts"
                  options={{
                    animation: "slide_from_right",
                    presentation: "card",
                    gestureEnabled: true,
                    animationTypeForReplace: "push",
                  }}
                />
              </Stack>
            </SafeAreaView>
          </SafeAreaProvider>
        </PortalProvider>
      </GestureHandlerRootView>
    </ReduxProvider>
  );
}


SplashScreen.preventAutoHideAsync();

function CustomLayout() {
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hideAsync();
      setIsReady(true);
    }, 2000)
  }, []);
  if (!isReady) return <Splash />;
  return <Layout />;
}

export default CustomLayout
// export default Layout 