
import { useEffect, useLayoutEffect, useState } from 'react';
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/redux/store";
import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Alert, Text, Image, useColorScheme, UIManager, Platform, BackHandler } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import PortalProvider from "@/components/Portal"
import * as NavigationBar from 'expo-navigation-bar';
import ChatsListProvider from "@/components/ChatsList"
import "../global.css"



function Splash() {
  return (
    <SafeAreaProvider >
      <SafeAreaView className="flex-1 bg-theme dark:bg-theme-dark items-center justify-center">
        <View className="flex-1 items-center justify-center">
          <View>
            <Image source={require("../assets/images/ic_launcher_foreground.png")} style={{
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
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      Alert.alert("Exit App", "Do you want to exit?", [
        {
          text: "Cancel",
          onPress: () => null,
          style: "cancel"
        },
        {
          text: "Exit",
          onPress: () => BackHandler.exitApp()
        }
      ]);
      return true // prevents app exit
    })
    return () => sub.remove()
  }, [])
  return (
    <ReduxProvider store={store} >
      <GestureHandlerRootView>
        <PortalProvider>
          <ChatsListProvider>
            <SafeAreaProvider>
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
          </ChatsListProvider>
        </PortalProvider>
      </GestureHandlerRootView>
    </ReduxProvider>
  );
}


//SplashScreen.preventAutoHideAsync();

function CustomLayout() {
  const [isReady, setIsReady] = useState(false);
  const isDark = useColorScheme() === 'dark';
  useLayoutEffect(() => {
    setTimeout(() => {
      SplashScreen.hideAsync();
      setIsReady(true);
    }, 2000)
  }, []);
  useLayoutEffect(() => {
    NavigationBar.setBackgroundColorAsync(isDark ? '#ff0000' : '#ffffff')
    NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark')
  }, [isDark])
  return (
    (!isReady) ?
      <>
        <StatusBar
          style={isDark ? "light" : "dark"}
          backgroundColor={isDark ? "#f00" : "#0f0"}
        />
        <Splash />
      </>
      :
      <>
        <StatusBar
          style={isDark ? "light" : "dark"}
          backgroundColor={isDark ? "#f00" : "#0f0"}
        />
        <Layout />
      </>
  )
}

//export default CustomLayout
export default Layout 