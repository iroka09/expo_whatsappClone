
import { useEffect, useLayoutEffect, useState } from 'react';
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/redux/store";
import { Stack, useRouter } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Alert, Text, Image, useColorScheme, UIManager, Platform, BackHandler, ToastAndroid } from 'react-native';
import { PaperProvider } from "react-native-paper";
import { KeyboardProvider } from "react-native-keyboard-controller";
import SoundProvider from "@/components/SoundProvider"
//import * as SplashScreen from 'expo-splash-screen';
//import { StatusBar } from 'expo-status-bar';
//import * as NavigationBar from 'expo-navigation-bar';
import * as MediaLibrary from "expo-media-library";
import "../global.css"


/*
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
*/

let willExit = false
let tm
export default function Layout() {
  const router = useRouter()
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      function byTiming() {
        clearTimeout(tm)
        if (willExit) {
          willExit = false
          BackHandler.exitApp()
          return false
        }
        willExit = true
        tm = setTimeout(() => { willExit = false }, 2000)
        ToastAndroid.showWithGravityAndOffset("Press again to exit.", ToastAndroid.SHORT, ToastAndroid.BOTTOM, 0, 0)
        return true
      }
      function byAlertWindow() {
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
        return true
      }
      if (!router.canGoBack()) {
        return byTiming()
        //return byAlertWindow()
      }
    })
    return () => sub.remove()
  }, [])
  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") alert("Media permission denied");
    })()
  }, [])
  return (
    <ReduxProvider store={store} >
      <GestureHandlerRootView>
        <KeyboardProvider>
          <PaperProvider>
            <SoundProvider>
              <SafeAreaProvider>
                <SafeAreaView className="flex-1 bg-theme dark:bg-theme-dark">
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      presentation: "card",
                      animation: "slide_from_right",
                      animationTypeForReplace: "push",
                      gestureEnabled: true,
                    }}
                  >
                    <Stack.Screen name="index" />
                    <Stack.Screen
                      name="(main)"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="contacts"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="conversation/[id]"
                      options={{ headerShown: false }}
                    />
                  </Stack>
                </SafeAreaView>
              </SafeAreaProvider>
            </SoundProvider>
          </PaperProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </ReduxProvider>
  );
}


//SplashScreen.preventAutoHideAsync();
/*
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
*/