
import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "expo-router";
import { View, Pressable, Text, BackHandler, Alert, useColorScheme } from "react-native";
import ReAnimated, { useSharedValue, useAnimatedStyle, withTiming, interpolate } from "react-native-reanimated"
import { MessageSquareText, MessageCircleHeart, UsersRound, Phone, } from "lucide-react-native"
import ContactAndAiButtons from '@/components/ContactAndAiButtons';
import { useSelector } from "react-redux";
import constants from "@/data/constants.json"



const {
  paddingHorizontal,
  colors: {
    themes: {
      light: { primary, secondary: light_secondary },
      dark: { secondary: dark_secondary }
    }
  }
} = constants


export default function CustomTabBar({ navigation }: any) {
  const newMessagesCount = useSelector((state: RootState) => state.chats.unreadCount.length);
  const animVal = useSharedValue(0)
  const pathname = usePathname()
  const isDarkMode = useColorScheme() === "dark"
  const fabStyle = useAnimatedStyle(() => ({
    opacity: interpolate(animVal.value, [0, 0.7], [0, 1],
      {
        extrapolateRight: "clamp"
      }),
    transform: [{
      scaleX: interpolate(animVal.value, [0, 0.7], [0.6, 1],
        {
          extrapolateRight: "clamp"
        })
    }]
  }))
  const fabIconStyle = useAnimatedStyle(() => ({
    transform: [{
      scale: interpolate(animVal.value, [0, 0.8, 1], [0.9, 1.2, 1])
    }]
  }))
  useLayoutEffect(() => {
    animVal.value = withTiming(1)
    return () => {
      animVal.value = 0
    }
  }, [pathname])
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (pathname !== "/chats") {
        navigation.navigate("chats"); // go to the first route
        return true
      }
    })
    return () => sub.remove()
  }, [pathname])
  return (
    <View className="relative">
      <ContactAndAiButtons />
      <View style={{ flexDirection: "row", paddingVertical: 12, paddingHorizontal, justifyContent: "space-between", borderTopWidth: .3 }} className="relative bg-theme dark:bg-theme-dark border-slate-300 dark:border-slate-800">
        {([
          [MessageSquareText, "chats", "Chats"],
          [MessageCircleHeart, "updates", "Updates"],
          [UsersRound, "communities", "Communities"],
          [Phone, "calls", "Calls"]
        ] as const).map(([Icon, tabName, label]) => {
          const isActive = (pathname === `/${tabName}`) || (pathname === "/" && tabName === "chats")
          //     if (tabName === "chats" && newMessagesCount > 0) console.log("yes:", newMessagesCount)
          return (
            <Pressable
              key={tabName}
              onPress={() => {
                navigation.navigate(tabName)
              }}
            >
              <View style={{ alignItems: "center" }}>
                <View
                  style={{
                    position: "relative",
                    paddingVertical: 5,
                    paddingHorizontal: 25,
                  }}
                  className="flex-row"
                >
                  {isActive &&
                    <ReAnimated.View
                      style={[
                        fabStyle,
                        {
                          position: "absolute",
                          borderRadius: 999,
                          overflow: "hidden",
                          inset: 0,
                          backgroundColor: isDarkMode ? dark_secondary : light_secondary,
                        }]}
                    />
                  }
                  {isActive ? (
                    <ReAnimated.View style={fabIconStyle}>
                      <Icon
                        color={
                          isActive ?
                            (isDarkMode ? "#efea" : "#040")
                            :
                            (isDarkMode ? "white" : undefined)
                        }
                      />
                    </ReAnimated.View>
                  ) : (
                    <Icon
                      color={
                        isActive ?
                          (isDarkMode ? "#efea" : "#040")
                          :
                          (isDarkMode ? "white" : undefined)
                      }
                    />
                  )}
                  {tabName === "chats" && newMessagesCount > 0 && (
                    <View
                      className="flex justify-center items-center absolute rounded-full right-5 top-[2]"
                      style={{
                        backgroundColor: primary,
                        height: 17,
                        minWidth: 17,
                        paddingHorizontal: 3
                      }}
                      onLayout={(e) => {
                        // console.log(e.nativeEvent.layout)
                      }}
                    >
                      <Text className="text-white dark:text-slate-900 text-xs font-[600]">
                        {newMessagesCount > 99 ? "99+" : newMessagesCount}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }} className="dark:text-white">
                  {label}
                </Text>
              </View>
            </Pressable>)
        })}
      </View >
    </View >
  );
}

