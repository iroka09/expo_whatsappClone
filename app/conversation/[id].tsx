import React, { useState, lazy, memo, useCallback, useEffect, useRef, useMemo, useLayoutEffect } from "react";
import { ImageBackground, View, Text, TextInput, ScrollView, SectionList, StyleSheet, Image, Vibration, Alert, Platform, useColorScheme, BackHandler, Dimensions, ActivityIndicator, ToastAndroid, Keyboard } from "react-native";
import { BaseButton, BorderlessButton } from "react-native-gesture-handler"
import { KeyboardAvoidingView } from "react-native-keyboard-controller"
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated"
import { Camera, Search, Plus, ArchiveRestore, CheckCheck, Check, EllipsisVertical, Pin, ArrowLeft, BellOff, Trash } from "lucide-react-native"
import IconButton from "@/components/IconButton"
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { toggleChatsSelection, handleMarkChatAsRead, handleAddNewConversationChat } from "@/redux/reducers/chats_tab_reducer"
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, usePathname, useRouter } from "expo-router"
import random from "random"
import moment from "moment-timezone"
import constants from "@/data/constants.json"
import { useSafeArea } from 'react-native-safe-area-context';
import { Audio } from 'expo-av'
import { useAudioPlayer } from 'expo-audio'




const {
  paddingHorizontal,
  colors: {
    themes: {
      light: { primary, secondary: light_secondary, background: backgroundLight },
      dark: { secondary: dark_secondary, background: backgroundDark }
    }
  }
} = constants

const { width: windowWidth } = Dimensions.get('window');



const bubbleObj = {
  username: null,
  avatar: null,
  messageIds: [],
  fromMe: false,
}

export default function Conversations() {
  const isDarkMode = useColorScheme() === "dark"
  //  const selectedChatsIds = useSelector((state: RootState) => state.chats.selectedChatsIds);
  const sectionListRef = useRef()
  const sectionListCanAutoScrollRef = useRef(false)
  const chat_id = +useLocalSearchParams().id
  const chatsList = useSelector((state: RootState) => state.chats.chatsList.find(x => x.id === chat_id))
  const conversation = useSelector((state: RootState) => state.chats.conversations.find(x => x.id === chat_id))
  const unreadCount = useSelector((state: RootState) => state.chats.unreadCount.find(x => x.id === chat_id)?.unreadCount)
  const dispatch = useDispatch<AppDispatch>();
  const pathname = usePathname()
  const { top } = useSafeArea()
  //  const messageSentAudio = useAudioPlayer(require('@/assets/sounds/mixkit_software_interface_remove.wav'))
  useEffect(() => {
    if (unreadCount > 0) dispatch(handleMarkChatAsRead(chat_id))
  }, [])
  return (
    <ImageBackground
      source={isDarkMode ? require("@/assets/images/whatsapp_conversation_dark.jpg") : require("@/assets/images/whatsapp_conversation_light.png")}
      resizeMode="cover" // or "contain"
      className="flex-1 "
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior="padding"
        keyboardVerticalOffset={top}
      >
        <Header chatsList={chatsList} />
        <SectionList
          ref={sectionListRef}
          sections={conversation.conversations}
          // contentContainerStyle={{ }}
          // style={{ }}
          keyExtractor={(item) => item.id} //item is data[key]
          renderItem={({ item }) => <Bubble item={item} profile={chatsList} />}
          renderSectionHeader={({ section }) => {
            const index = conversation.conversations.findIndex(x => x.id === section.id)
            return <SectionHeader section={section} prevSection={index > 0 ? conversation.conversations[index - 1] : null} index={index} />
          }}
          onContentSizeChange={(height, scrollHeight) => {
            if (sectionListRef.current.autoScrollEnabled) {
              requestAnimationFrame(() => {
                const sections = conversation.conversations
                // alert([...(sections[sections.length - 1]?.data)].pop().message)
                sectionListRef.current?.scrollToLocation({
                  sectionIndex: sections.length - 1,
                  itemIndex: sections[sections.length - 1]?.data.length - 1,
                  animated: true
                })
                //  messageSentAudio.play()
              })
              sectionListRef.current.autoScrollEnabled = false
            }
          }}
        />
        <BottomInputBar chat_id={chat_id} sectionListRef={sectionListRef} />
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}


function Header({ chatsList }) {
  const isDarkMode = useColorScheme() === "dark"
  const router = useRouter()
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      router.back()
      return true; // prevents app exit
    })
    return () => sub.remove()
  }, [])
  return (
    <View
      className="flex-row items-center bg-theme dark:bg-theme-dark pb-1 px-1 py-2"
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



const SectionHeader = memo(({ section, prevSection, index }) => {
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
})


const BottomInputBar = memo(({ chat_id, sectionListRef }) => {
  const [height, setHeight] = useState<number>()
  const [textInputHeight, setTextInputHeight] = useState<number>()
  const [borderRadius, setBorderRadius] = useState<number>()
  const [message, setMessage] = useState("")
  const [hasText, setHasText] = useState(!!message?.trim())
  const dispatch = useDispatch<AppDispatch>();
  const isDarkMode = useColorScheme() === "dark"
  // const soundRef = useRef<Audio.Sound | null>(null);
  const handlePressSubmit = (isMessage: boolean) => {
    if (isMessage) {
      sectionListRef.current.autoScrollEnabled = true
      dispatch(handleAddNewConversationChat({ id: chat_id, message }))
      setMessage("")
      setTextInputHeight(height)
    }
  }
  useEffect(() => {
    setHasText(!!message?.trim())
  }, [message])
  /*  useEffect(() => {
      Audio.Sound.createAsync(require('@/assets/sounds/mixkit_software_interface_remove.wav'))
        .then(({ sound }) => {
          soundRef.current = sound;
        });
      return () => {
        soundRef.current?.unloadAsync();
      };
    }, []);
  const play = async () => {
    await soundRef.current?.replayAsync();
  };*/
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
          onChangeText={setMessage}
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
        />
        <Animated.View
          className="flex-row"
          style={{
            transitionProperty: "width",
            transitionDuration: ".2s",
            transitionTimingFunction: "linear",
            width: hasText ? 38 : 76
          }}
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
        <BorderlessButton rippleColor="#0005" style={{ padding: 10 }} onPress={() => handlePressSubmit(hasText)}>
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
})



const Bubble = memo(({ item, profile }) => {
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
  const backgroundColor = `hsl(${colors[0]},${colors[1]}%,75%)`
  const isNew = (Date.now() - item.timestamp) < 5 * 1000
  const [messageStatus, setMessageStatus] = useState(
    fromMe ? (
      profile.type === "group" ?
        "delivered"
        :
        random.choice(["delivered", "unread", isNew ? undefined : "read"])
    )
      :
      (null)
  )
  useEffect(() => {
    if (random.boolean() || profile.type === "group") return
    setTimeout(() => {
      if (fromMe) {
        setMessageStatus("read")
        if (isNew) {
          setTimeout(() => {
            setMessageStatus(random.choice(["delivered", "read"]))
          }, random.choice([500, 10000]))
        }
      }
    }, random.choice([500, 10000]))
  }, [])
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
        {
          profile.type === "group" && (!fromMe) &&
          <View className="relative aspect-square w-[30px] rounded-full overflow-hidden mr-2">
            {isGroup_isFirstChat_isNotMe &&
              <>
                <Text
                  className="absolute w-full aspect-square uppercase text-2xl font-medium text-center"
                  style={{
                    backgroundColor: isDarkMode ? foregroundColor : backgroundColor,
                    color: isDarkMode ? backgroundColor : foregroundColor
                  }}>
                  {username.charAt(0)}
                </Text>
                <Image
                  source={{ uri: avatar }}
                  className="absolute w-full aspect-square "
                />
              </>}
          </View>
        }
        <View
          className={`${fromMe ? "ml-auto bg-[#D7FDD2] dark:bg-[#134D37] mr-2" : "justify-start bg-white dark:bg-[#1F272A]"} relative rounded-[12] py-1 px-3 border-b-[.5px] border-black/10 py-50 `}
          style={{
            maxWidth: windowWidth * 0.8,  //80%
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
})



/*
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

*/