import React, { lazy, memo, useState, useCallback, useEffect, useRef, useMemo, useLayoutEffect } from "react";
import { ImageBackground, View, Text, TextInput, ScrollView, SectionList, StyleSheet, Image, Vibration, Alert, Platform, useColorScheme, BackHandler, Dimensions, ActivityIndicator, ToastAndroid, KeyboardAvoidingView, Keyboard } from "react-native";
import { BaseButton, BorderlessButton } from "react-native-gesture-handler"
import Animated, { useSharedValue, useAnimatedStyle, interpolate, withTiming, ZoomIn, ZoomOut } from "react-native-reanimated"
import { Camera, Search, Plus, ArchiveRestore, CheckCheck, Check, EllipsisVertical, Pin, ArrowLeft, BellOff, Trash } from "lucide-react-native"
import IconButton from "@/components/IconButton"
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { toggleChatsSelection, handleMarkChatAsRead } from "@/redux/reducers/chats_tab_reducer"
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, usePathname, useRouter } from "expo-router"
import random from "random"
import moment from "moment-timezone"
import constants from "@/data/constants.json"
import { useSafeArea } from 'react-native-safe-area-context';


const {
  paddingHorizontal,
  colors: {
    themes: {
      light: { primary, secondary: light_secondary, background: backgroundLight },
      dark: { secondary: dark_secondary, background: backgroundDark }
    }
  }
} = constants

const { width: screenWidth } = Dimensions.get('screen');



const bubbleObj = {
  username: null,
  avatar: null,
  messageIds: [],
  fromMe: false,
}

export default function Conversations() {
  const isDarkMode = useColorScheme() === "dark"
  //  const selectedChatsIds = useSelector((state: RootState) => state.chats.selectedChatsIds);
  const params = useLocalSearchParams()
  const chatsList = useSelector((state: RootState) => state.chats.chatsList.find(x => x.id === +params.id))
  const conversation = useSelector((state: RootState) => state.chats.conversations.find(x => x.id === +params.id))
  const unreadCount = useSelector((state: RootState) => state.chats.unreadCount.find(x => x.id === +params.id)?.unreadCount)
  const dispatch = useDispatch<AppDispatch>();
  const pathname = usePathname()
  const { top } = useSafeArea()
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => {
      // setKeyboardVisible(true);
    });
    const hide = Keyboard.addListener("keyboardDidHide", () => {
      //  setKeyboardVisible(false);
    });
    return () => {
      show.remove(); hide.remove();
    };
  }, []);
  useEffect(() => {
    if (unreadCount > 0) dispatch(handleMarkChatAsRead(+params.id))
  }, [])
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-theme dark:bg-theme-dark" behavior="padding"
      //  keyboardVerticalOffset={keyboardVisible ? top : 0}
      keyboardVerticalOffset={top}
    >
      <Header chatsList={chatsList} />
      <ImageBackground
        source={isDarkMode ? require("@/assets/images/whatsapp_conversation_dark.jpg") : require("@/assets/images/whatsapp_conversation_light.png")}
        resizeMode="cover" // or "contain"
        className="flex-1"
      >
        <SectionList
          sections={conversation.conversations}
          contentContainerStyle={{
            // padding: 2,
          }}
          style={{
            // padding: 2,
          }}
          keyExtractor={(item) => item.id} //item is data[key]
          renderItem={({ item }) => <Bubble item={item} profile={chatsList} />}
          renderSectionHeader={({ section }) => {
            const index = conversation.conversations.findIndex(x => x.id === section.id)
            return <SectionHeader section={section} prevSection={index > 0 ? conversation.conversations[index - 1] : null} index={index} />
          }}
        />
        <BottomInputBar />
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}


function Header({ chatsList }) {
  const isDarkMode = useColorScheme() === "dark"
  const router = useRouter()
  return (
    <View
      className="flex-row items-center pb-1 px-1 py-2"
    >
      <IconButton onPress={() => router.back()}><ArrowLeft color={isDarkMode ? "#aaa" : "#666"} /></IconButton>
      <Image
        source={{ uri: chatsList.avatar.lowQuality }}
        style={{
          width: 35,
          aspectRatio: 1,
          borderRadius: 999,
          marginLeft: 2,
          marginRight: 7,
          backgroundColor: "gray"
        }}
      />
      <Text
        className="dark:text-white shrink text-xl"
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {chatsList.name || chatsList.phone}
      </Text>
      <IconButton containerStyle={{ marginLeft: "auto" }}><MaterialCommunityIcons name="video-outline" size={28} color={isDarkMode ? "#aaa" : "#666"} /></IconButton>
      <IconButton><MaterialCommunityIcons name="phone-outline" size={24} color={isDarkMode ? "#aaa" : "#666"} /></IconButton>
      <IconButton><EllipsisVertical color={isDarkMode ? "#aaa" : "#666"} /></IconButton>
    </View>
  )
}



function SectionHeader({ section, prevSection, index }) {
  // console.log("section: ", section)
  // console.log("prevSection: ", prevSection)
 /* if (typeof section.user !== "string") {
    console.log(section.user)
  }*/
  bubbleObj.username = (typeof section.user === "string") ? section.user : "unknown";
  bubbleObj.avatar = section.avatar
  bubbleObj.messageIds = section.data.map(x => x.id)
  bubbleObj.fromMe = section.user === 1
  const prevDate = prevSection ? moment(prevSection.timestamp * 1000).format("MMMM DD, YYYY") : null
  const date = moment(section.timestamp).format("MMMM DD, YYYY")
  const show = prevDate !== date
  if (!show) return null
  return (
    <View className=" items-center mt-2">
      <Text className="bg-slate-100 dark:bg-[#13181C] text-neutral-800 dark:text-neutral-200 rounded-lg px-3 py-2 my-2 text-xs border-b-[.5px] border-black/10">
        {date}
      </Text>
      {index === 0 &&
        <Text className="max-w-[250px] mb-3 text-center bg-[#FFF0D3] dark:bg-[#13181C] text-neutral-800 dark:text-amber-300/80 rounded-lg px-3 py-2 my-2 text-sm border-b-[.5px] border-black/10">
          Messages and calls are end-to-end encrypted. Only people in this chat can read, listen to, or share them.{"\n"}Learn more.
        </Text>}
    </View>
  )
}


function BottomInputBar() {
  const [height, setHeight] = useState<number>()
  const [textInputHeight, setTextInputHeight] = useState<number>()
  const [borderRadius, setBorderRadius] = useState<number>()
  const [message, setMessage] = useState("")
  const [hasText, setHasText] = useState(!!message?.trim())
  const isDarkMode = useColorScheme() === "dark"
  const marginProgress = useSharedValue(0)
  const marginStyle = useAnimatedStyle(() => ({
    width: interpolate(marginProgress.value, [0, 1], [76, 38])
  }))
  useEffect(() => {
    marginProgress.value = withTiming(+hasText)
  }, [hasText])
  return (
    <View className="flex-row gap-3 items-end justify-between p-2">
      <View
        className="flex-1 flex-row items-end bg-white dark:bg-[#1F272A] overflow-hidden"
        style={{ borderRadius: height / 2, paddingHorizontal: 2 }}
      >
        <IconButton containerStyle={{ marginBottom: 2 }}><MaterialCommunityIcons name="sticker-emoji" size={24} color={isDarkMode ? "#aaa" : "#666"} /></IconButton>
        <TextInput
          className="flex-1 placeholder:text-[#666] dark:placeholder:text-[#ccc] text-[#666] dark:text-[#ccc]"
          value={message}
          onChangeText={(x) => {
            setMessage(x)
            setHasText(!!x.trim())
          }}
          onLayout={e => {
            if (height === undefined) {
              setHeight(e.nativeEvent.layout.height)//only used for border radius by half of it
            }
          }}
          onContentSizeChange={(e) => {
            setTextInputHeight(e.nativeEvent.contentSize.height);
          }}
          style={{
            color: isDarkMode ? "#ddd" : "#666",
            fontSize: 16,
            maxHeight: 200,
            height: textInputHeight,
          }}
          multiline
          placeholder="Message"
        // placeholderTextColor={isDarkMode ? "#ddd" : "#666"}
        />
        <Animated.View
          className="flex-row"
          style={marginStyle}
        >
          <IconButton
            containerStyle={{
              marginBottom: 2
            }}
          >
            <MaterialIcons name="attachment" size={24} color={isDarkMode ? "#aaa" : "#666"} style={{ transform: [{ rotate: "-90deg" }] }} />
          </IconButton>
          <IconButton containerStyle={{ marginBottom: 2 }}>
            <Camera size={24} color={isDarkMode ? "#aaa" : "#666f"} />
          </IconButton>
        </Animated.View>
      </View>
      <View
        className="items-center aspect-square justify-center overflow-hidden rounded-full"
        style={{ backgroundColor: primary, height }}
      >
        <BorderlessButton rippleColor="#0005" style={{ padding: 10 }}>
          {hasText ?
            <Animated.View key="send" entering={ZoomIn} exiting={ZoomOut.duration(100)}>
              <MaterialCommunityIcons name="send" size={24} color="white" />
            </Animated.View>
            :
            <Animated.View key="microphone" entering={ZoomIn} exiting={ZoomOut.duration(100)}>
              <MaterialCommunityIcons name="microphone" size={24} color="white" />
            </Animated.View>
          }
        </BorderlessButton>
      </View>
    </View >
  )
}


function Bubble({ item, profile }) {
  //  console.log("all: ", messageIds)
  // console.log("one: ", item.id)
  const avatar = useRef(bubbleObj.avatar).current
  const username = useRef(bubbleObj.username).current
  const fromMe = useRef(bubbleObj.fromMe).current
  const messageIds = useRef(bubbleObj.messageIds).current
  const isDarkMode = useColorScheme() === "dark"
  const nextPersonBeginsChat = messageIds[0] === item.id
  const isGroup_isFirstChat_isNotMe = (!fromMe) && profile.type === "group" && nextPersonBeginsChat
  const phone = useRef(`+234 ${random.choice("802,806,706,813,906,903,703".split(","))} ${random.int(100, 999)} ${random.int(1000, 9999)}`).current
  const colors = useRef([random.int(0, 360), random.int(20, 100)]).current
  const foregroundColor = `hsl(${colors[0]},${colors[1]}%,30%)`
  const backgroundColor = `hsl(${colors[0]},${colors[1]}%,${isDarkMode ? "60%" : "75%"})`
  const messageStatus = useRef(
    fromMe ? (
      profile.type === "group" ?
        "delivered"
        :
        random.choice(["delivered", "read", "delivered", "unread"])
    )
      :
      (null)
  ).current
  return (
    <BaseButton
      rippleColor="#6665"
      onPress={() => {
        // alert("clicked")
      }}
    >
      <View
        className={`flex-row w-full px-2 mb-1 ${nextPersonBeginsChat ? "mt-2" : "mt-1"}`}
      >
        {profile.type === "group" && (!fromMe) &&
          <View className="relative aspect-square w-[30px] rounded-full overflow-hidden mr-2">
            {isGroup_isFirstChat_isNotMe &&
              <>
                <Text className="absolute w-full aspect-square uppercase text-2xl font-medium text-center" style={{ backgroundColor, color: foregroundColor }}>
                  {username.charAt(0)}
                </Text>
                <Image
                  source={{ uri: avatar }}
                  className="absolute w-full aspect-square "
                />
              </>}
          </View>}
        <View
          className={`${fromMe ? "ml-auto bg-[#D7FDD2] dark:bg-[#134D37] mr-2" : "justify-start bg-white dark:bg-[#1F272A]"} relative rounded-[12] py-1 px-3 border-b-[.5px] border-black/10 py-50 `}
          style={{
            maxWidth: screenWidth * 0.8,  //80%
            ... (profile.type === "user" && !fromMe) && { marginLeft: 8 },
          }}
        >
          {isGroup_isFirstChat_isNotMe &&
            <View className="flex-row gap-2 justify-between">
              <Text
                className="capitalize flex-1 font-[500]"
                style={{ color: foregroundColor }}
                numberOfLines={1}
              // ellipsizeMode="tail"
              >
                {username}
              </Text>
              <Text
                className="text-slate-800/60 dark:text-slate-200/60"
                numberOfLines={1}
              //  ellipsizeMode="tail"
              >
                {phone}
              </Text>
            </View>}
          <View className="flex-row flex-wrap pb-1">
            <View className="pb-1">
              <Text className="text-slate-800 dark:text-slate-200">{item.message}</Text>
            </View>
            <View className="flex-row justify-end items-end ml-auto pl-3 gap-2">
              <Text className="text-slate-800/60 dark:text-slate-200/60 ml-auto text-xs">{moment(item.timestamp).format("h:mm A")}</Text>
              {
                messageStatus && (
                  messageStatus === "delivered" ?
                    <Check size={15} style={{ color: isDarkMode ? "#aaa" : "#555" }} />
                    :
                    <CheckCheck size={15} style={{ color: messageStatus === "read" ? "#08f" : (isDarkMode ? "#aaa" : "#555") }} />
                )
              }
            </View>
          </View>
          {nextPersonBeginsChat &&
            <View
              className={`absolute z-[-1] top-[.45] w-0 h-0 border-t-[14px] ${fromMe ? "border-l-[10px] border-r-[10px] right-[-6] border-t-[#D7FDD2] dark:border-t-[#134D37]" : "border-l-[10px] border-r-[10px] left-[-6]  border-t-white dark:border-t-[#1F272A]"} border-l-transparent border-r-transparent`}
            />
          }
        </View>
      </View>
    </BaseButton>
  )
}




interface ConversationType {
  id: number;
  conversations: Array<{
    id: string,
    user: string | 1 | 2;
    data: Array<{
      id: string,
      message: string,
      timestamp: number
    }>;
    avatar: string;
    timestamp: number;
  }>;
};


export interface ChatListType {
  id: number;
  type: "user" | "group";
  name: string | null;
  phone?: string;//for type=user
  avatar: {
    lowQuality: string;
    highQuality: string;
  },
  lastMessage: {
    text: string;
    fromMe: boolean;
    status?: "sent" | "delivered" | "read";//for fromMe=true
  },
  date: string;
  hasStatus: boolean;
  unreadCount: number;
}
type Id_Arr_Type = [number, "user" | "group"]

