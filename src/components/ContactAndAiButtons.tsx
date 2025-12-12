
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useRouter, usePathname } from "expo-router";
import { View, Image, Pressable, useColorScheme } from "react-native";
import ReAnimated, { useSharedValue, useAnimatedStyle, withTiming, interpolate } from "react-native-reanimated"
import { runOnJS } from "react-native-worklets"
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';


export default function ContactAndAiButtons() {
  const animVal = useSharedValue(0)
  const router = useRouter()
  const isDarkMode = useColorScheme() === "dark"
  const pathname = usePathname()
  const isAllowedPath = useRef(["/chats", "/updates", "/calls"]).current.includes(pathname)
  const [isButtonVisible, setIsButtonVisible] = useState(isAllowedPath)
  const [topButtonIconName, setTopButtonIconName] = useState<string>()
  const [bottomButtonIconName, setBottomButtonIconName] = useState<string>()
  const translationStyle = useAnimatedStyle(() => ({
    transform: [{
      translateY: interpolate(animVal.value, [0, 100], [0, 50])
    }],
    opacity: interpolate(animVal.value, [0, 50], [1, 0], { extrapolateRight: "clamp" })
  }))
  const removeButton = () => setIsButtonVisible(false)
  useLayoutEffect(() => {
   // alert(pathname)
    if (pathname === "/chats") {
      setTopButtonIconName("image")
      setBottomButtonIconName("message-plus")
    }
    if (pathname === "/updates") {
      setTopButtonIconName("edit")
      setBottomButtonIconName("camera-plus")
    }
    if (pathname === "/calls")
      setBottomButtonIconName("phone-plus")
    if (isAllowedPath) setIsButtonVisible(true)
    animVal.value = withTiming(isAllowedPath && pathname !== "/calls" ? 0 : 100, {}, (isFinished) => {
      if (isFinished && !isAllowedPath) {
        runOnJS(removeButton)()
      }
    })
  }, [pathname])
  if (!isButtonVisible) return null
  return (
    <View className="absolute right-[15] bottom-[120%] items-center w-[55]">
      <ReAnimated.View
        className="items-center justify-center"
        style={[
          translationStyle,
          {
            position: "absolute",
            bottom: 75,
            width: "70%"
          }
        ]}
      >
        <View style={{
          backgroundColor: "#0007",
          borderRadius: 5,
          position: "absolute",
          top: 5, left: 5, right: 5, bottom: -1,
          filter: "blur(4px)"
        }}
        />
        <Pressable className="flex items-center justify-center rounded-xl bg-neutral-100 dark:bg-slate-700 w-full aspect-square" >
          {topButtonIconName === "image" ?
            <Image source={require("@/assets/images/meta_ai.png")} style={{ width: 35, height: 35 }} />
            :
            <MaterialIcons name={topButtonIconName} size={24} color={isDarkMode ? "white" : "black"} />
          }
        </Pressable>
      </ReAnimated.View>
      <View style={{ opacity: isAllowedPath ? 1 : 0 }} className="relative w-full">
        <View style={{
          backgroundColor: "#0005",
          borderRadius: 5,
          position: "absolute",
          top: 5, left: 5, right: 5, bottom: -1,
          filter: "blur(3px)"
        }}
        />
        <Pressable
          className="flex justify-center items-center bg-primary rounded-2xl w-full aspect-square"
          onPress={() => {
            router.push("/contacts")
          }}
        >
          <MaterialCommunityIcons
            name={bottomButtonIconName}
            size={24}
            color={isDarkMode ? "black" : "white"}
            style={{
              transform: [{
                rotateX: "0deg"
              }]
            }}
          />
        </Pressable>
      </View>
    </View>
  )
}