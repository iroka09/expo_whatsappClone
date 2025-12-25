import React, { useState, memo, useCallback, useEffect, useRef } from "react";
import { ImageBackground, View, Text, TextInput, FlatList, SectionList, Image, Alert, useColorScheme, BackHandler, Dimensions, ToastAndroid } from "react-native";
// import { FlashList } from '@shopify/flash-list';
import { BaseButton, BorderlessButton } from "react-native-gesture-handler"
import { KeyboardAvoidingView } from "react-native-keyboard-controller"
import Animated, { LinearTransition, useSharedValue, useAnimatedStyle, withTiming, interpolate, ZoomIn, ZoomOut } from "react-native-reanimated"
import { Camera, Search, Plus, ArchiveRestore, CheckCheck, Check, EllipsisVertical, ArrowLeft, BellOff, Trash } from "lucide-react-native"
import IconButton from "@/components/IconButton"
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { handleMarkChatAsRead, handleAddNewConversationChat } from "@/redux/reducers/chats_tab_reducer"
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, usePathname, useRouter } from "expo-router"
import random from "random"
import moment from "moment-timezone"
import constants from "@/data/constants.json"
import { useSafeArea } from 'react-native-safe-area-context';
import { faker } from "@faker-js/faker"
import Feather from '@expo/vector-icons/Feather';
import { File, Directory, Paths } from "expo-file-system";
import { Audio, AVPlaybackStatus } from 'expo-av'
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio'
import {
  Waveform,
  type IWaveformRef,
} from '@simform_solutions/react-native-audio-waveform';




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


const playSound = async (key: SoundKeysType) => {
  let sound = null
  switch (key) {
    case "textMessageSentSound":
      const { sound: textMessageSentSound } = await Audio.Sound.createAsync(require('@/assets/sounds/text_message_sent.m4a'));
      sound = textMessageSentSound
      break
    case "voiceNoteStartSound":
      const { sound: voiceNoteStartSound } = await Audio.Sound.createAsync(require('@/assets/sounds/voice_note_start.m4a'));
      sound = voiceNoteStartSound
      break
    case "voiceNotePausedSound":
      const { sound: voiceNotePausedSound } = await Audio.Sound.createAsync(require('@/assets/sounds/voice_note_paused.mp3'));
      sound = voiceNotePausedSound
      break
    case "voiceNoteStopSound":
      const { sound: voiceNoteStopSound } = await Audio.Sound.createAsync(require('@/assets/sounds/voice_note_stop.m4a'));
      sound = voiceNoteStopSound
      break
    case "voiceNoteSendSound":
      const { sound: voiceNoteSendSound } = await Audio.Sound.createAsync(require('@/assets/sounds/voice_note_send.m4a'));
      sound = voiceNoteSendSound
      break
    case "incomingMessageSound":
      const { sound: incomingMessageSound } = await Audio.Sound.createAsync(require('@/assets/sounds/incoming_message.mp3'));
      sound = incomingMessageSound
      break
    default:
      break
  }
  if (sound === null) return
  sound.setOnPlaybackStatusUpdate(async (status) => {
    if (status.didJustFinish && !status.isLooping) {
      //finished playing
      await sound.unloadAsync()
    }
  })
  //  await sound.setPositionAsync(0)
  sound.playAsync()
}


type SoundKeysType = "textMessageSentSound" | "voiceNotePausedSound" | "voiceNoteStartSound" | "voiceNoteStopSound" | "voiceNoteSendSound" | "incomingMessageSound"

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
  const generateComputerMessage = useCallback(() => {
    clearTimeout(generateComputerMessage.tm)
    generateComputerMessage.tm = setTimeout(() => {
      const message = faker.lorem.text()
      const type = chatsList.type
      const user = (type === "user") ? 2 : faker.person.fullName();
      const avatar = faker.image.personPortrait({ size: '32' })
      sectionListRef.current.user = user
      dispatch(handleAddNewConversationChat({ id: chat_id, message, user, avatar }))
    }, random.choice([1000, 10000]))
  }, [])
  useEffect(() => {
    //   generateComputerMessage()
    return () => clearTimeout(generateComputerMessage.tm)
  }, [])
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
            requestAnimationFrame(() => {
              const sections = conversation.conversations
              const itemIndex = sections[sections.length - 1]?.data.length - 1;
              const timestamp = sections[sections.length - 1]?.data[itemIndex].timestamp
              if (timestamp < (Date.now() - (5 * 1000))) {
                //old messages that are less than 5sec ago are not allowed to scroll the content
                return
              }
              sectionListRef.current?.scrollToLocation({
                sectionIndex: sections.length - 1,
                itemIndex,
                animated: true
              })
              if (sectionListRef.current?.user === 1) {
                playSound("textMessageSentSound")
              }
              else if (sectionListRef.current?.user) playSound("incomingMessageSound")
              sectionListRef.current.user = undefined
              if (random.boolean()) generateComputerMessage()
              //  generateComputerMessage()
            })
          }}
        />
        <BottomInputBar chat_id={chat_id} sectionListRef={sectionListRef} playSound={playSound} />
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



type RecorderStateType = "idle" | "recording" | "paused" | "stopped"
let tt = 0

const BottomInputBar = memo(({ chat_id, sectionListRef, playSound }) => {
  const [height, setHeight] = useState<number>()
  const [textInputHeight, setTextInputHeight] = useState<number>()
  const [borderRadius, setBorderRadius] = useState<number>()
  const [message, setMessage] = useState("")
  const [hasText, setHasText] = useState(!!message?.trim())
  const dispatch = useDispatch<AppDispatch>();
  const isDarkMode = useColorScheme() === "dark"
  const [startTime, setStartTime] = useState<number | undefined>();
  const [recordingDuration, setRecordingDuration] = useState(0);
  const waveformBarHeightRef = useRef(0)
  const [recorderState, setRecorderState] = useState<RecorderStateType>("idle")
  const pressedSendButton_ref = useRef(false);
  const isRecordingRef = useRef(false);
  const recordingRef = useRef();
  // const soundRef = useRef<Audio.Sound | null>(null);
  const handleSendMessage = useCallback(() => {
    sectionListRef.current.user = 1
    dispatch(handleAddNewConversationChat({ id: chat_id, message, user: 1 }))
    setMessage("")
    setTextInputHeight(height)
  }, [message, height])
  const formatRecordingTime = useCallback((ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [])
  const dbToHeight = useCallback((db: number) => {
    const MAX_BAR_HEIGHT = 50;
    const minDb = -160;
    const maxDb = 0;
    // 0 to 160
    const normalized = Math.max(0, (db - minDb) / (maxDb - minDb))
    const height = Math.max(0, normalized * MAX_BAR_HEIGHT) // 0 to 50
    return Math.max(0, (height - 10))//from 0 to 10 are considered to be 0
  }, [])
  const handleSendVoiceNote = useCallback(async (uri) => {
    const file = new File(uri);
    const destination = new Directory(Paths.document, "Voices")
  //  await file.move(destination);//didn't work
    dispatch(handleAddNewConversationChat({
      id: chat_id,
      type: "voice-note",
      user: 1,
      uri: file.uri,
      size: file.size
    }))
    playSound("voiceNoteSendSound")
  }, [])
  const createRecorder = useCallback(async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== "granted") {
      alert("Microphone permission is required to record audio");
      return;
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    const recording = new Audio.Recording();
    recordingRef.current = recording
    await recording.prepareToRecordAsync({
      android: {
        extension: ".m4a",
        outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
        audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
        sampleRate: 11000,
        numberOfChannels: 1,
        bitRate: 19000,
      },
      ios: {
        extension: ".caf",
        audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_LOW,
        sampleRate: 11000,
        numberOfChannels: 1,
        bitRate: 19000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
      isMeteringEnabled: true, // for voice intensity metering
    });
    recording.setProgressUpdateInterval(100);
    recording.setOnRecordingStatusUpdate(async (status) => {
      // console.log("recordStatus", status)
      if (status.isDoneRecording) {
        //send or stopped
        isRecordingRef.current = false
        setRecordingDuration(0)
        const uri = recording.getURI()
        if (pressedSendButton_ref.current === true) {
          // for send
          pressedSendButton_ref.current = false
          handleSendVoiceNote(uri)
          return
        }
        // for stopped
        await (new File(uri)).delete() // delete when stopped without sending
      }
      if (status.isRecording) {
        isRecordingRef.current = true
        setRecordingDuration(status.durationMillis)
        waveformBarHeightRef.current = dbToHeight(status.metering)
      } else {
        waveformBarHeightRef.current = 0
      }
      if (status.isRecording === false && !status.isDoneRecording && status.durationMillis > 0) {
        //paused
        //   console.warn("paused")
      }
    });
  }, [])
  useEffect(() => {
    (async () => {
      switch (recorderState) {
        case "recording":
          playSound("voiceNoteStartSound")
          await new Promise(res => setTimeout(res, 500))
          await recordingRef.current?.startAsync();
          break;
        case "paused":
          playSound("voiceNotePausedSound")
          await recordingRef.current?.pauseAsync();
          break
        case "stopped":
          playSound("voiceNoteStopSound")
          if (isRecordingRef.current)
            await recordingRef.current?.stopAndUnloadAsync();
          break
        default:
          break
      }
    })()
  }, [recorderState])
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (recorderState !== "stopped") {
        setRecorderState("stopped")
        return true; // prevents app exit
      }
    })
    return () => sub.remove()
  }, [recorderState])
  useEffect(() => {
    return () => {
      if (isRecordingRef.current)
        recordingRef.current?.stopAndUnloadAsync()
    }
  }, [])
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
  if (recorderState === "stopped" || recorderState === "idle")
    return (
      <View className="flex-row gap-3 items-end justify-between p-2">
        <View
          className="flex-1 flex-row items-end bg-white dark:bg-[#1F272A] overflow-hidden"
          style={{ borderRadius: height ? (height / 2) : 999, paddingHorizontal: 2 }}
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
          <BorderlessButton
            rippleColor="#0005"
            style={{ padding: 10 }}
            onPress={async () => {
              if (hasText) handleSendMessage()
              else {
                await createRecorder()
                setRecorderState("recording")
              }
            }}
          >
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

  else {
    return (
      <View className="bg-theme dark:bg-theme-dark p-5 gap-5">
        <View className="flex-row gap-3 items-center">
          <Text className="text-neutral-500 text-lg">{formatRecordingTime(recordingDuration)}</Text>
          <WaveForm waveformBarHeightRef={waveformBarHeightRef} />
        </View>
        <View className="flex-row justify-between items-center">
          <IconButton onPress={() => { setRecorderState("stopped") }}>
            <Trash size={25} color={isDarkMode ? "#aaa" : "#666"} />
          </IconButton>
          <IconButton onPress={() => setRecorderState(recorderState === "paused" ? "recording" : "paused")}>
            {recorderState === "paused" ?
              <MaterialCommunityIcons name="microphone" size={25} color="#f22" style={{ transform: [{ scale: 1.1 }] }} />
              :
              <Feather name="pause" size={25} color="#f22" />
            }
          </IconButton>
          <View
            className="items-center aspect-square justify-center overflow-hidden rounded-full"
            style={{ backgroundColor: primary, height }}
          >
            <BorderlessButton
              rippleColor="#0005"
              style={{ padding: 10 }}
              onPress={() => {
                pressedSendButton_ref.current = true
                setRecorderState("stopped")
              }}
            >
              <MaterialCommunityIcons name="send" size={24} color="white" />
            </BorderlessButton>
          </View>
        </View>
      </View>
    )
  }
})


const barWidth = 2; const barGap = 2; const duration = 100
const WaveForm = memo(({ waveformBarHeightRef }) => {
  const [heights, setHeights] = useState([{ id: "wr3r5", value: 0 }])
  const translateProgress = useSharedValue(0)
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{
      translateX: interpolate(translateProgress.value, [0, barWidth + barGap], [0, -(barWidth + barGap)])
    }]
  }))
  useEffect(() => {
    const tm = setInterval(() => {
      setHeights(x => [
        ...x,
        {
          id: Math.random().toString(16).slice(-5),
          value: waveformBarHeightRef.current || 0,
        }
      ])
    }, 200)
    return () => clearInterval(tm)
  }, [])
  useEffect(() => {
    translateProgress.value = withTiming((barWidth + barGap) * heights.length, { duration })
  }, [heights])
  return (
    <View className="flex-1 relative h-[80px] justify-center overflow-hidden ring-amber-300">
      <Animated.View
        className="absolute left-full flex-row items-center justify-end"
        style={[
          containerStyle,
          { gap: barGap }
        ]}
      >
        {heights.map(height => <Bar key={height.id} height={height.value} />)}
      </Animated.View>
    </View>
  )
})



const Bar = memo(({ height }) => {
  return (
    <View
      className="rounded-full bg-gray-500"
      style={{ height, width: barWidth, minHeight: barWidth }}
    />
  )
})



let sss = 0

const Bubble = memo(({ item, profile }) => {
  const isVoiceNote = item.type === "voice-note"
  const isVideoNote = item.type === "video-note"
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
        setMessageStatus("delivered")
        if (isNew) setTimeout(() => setMessageStatus("read"), random.choice([3000, 10000]))
      }
    }, random.choice([1000, 3000]))
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
          // Avatar container of other people
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
          className={`
          ${fromMe ? "ml-auto bg-[#D7FDD2] dark:bg-[#134D37] mr-2" // right Bubble
              : // Left Bubble
              "justify-start bg-white dark:bg-[#1F272A]"} relative rounded-[12] py-1 px-3 border-b-[.5px] border-black/10 py-50 
          `}
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
            </View>
          }
          <View className="flex-row flex-wrap pb-1">
            <View className="pb-1">
              {isVoiceNote ?
                <VoiceNote item={item} />
                :
                <Text className="text-slate-800 dark:text-slate-200">{item.message}</Text>
              }
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
            //burble arrow
            <View
              className={`absolute z-[-1] top-[.45] w-0 h-0 border-t-[14px] ${fromMe ? "border-l-[10px] border-r-[10px] right-[-6] border-t-[#D7FDD2] dark:border-t-[#134D37]" : "border-l-[10px] border-r-[10px] left-[-6]  border-t-white dark:border-t-[#1F272A]"} border-l-transparent border-r-transparent`}
            />
          }
        </View>
      </View>
    </BaseButton >
  )
})



function VoiceNote({ item }) {
  const isDarkMode = useColorScheme() === "dark"
  const player = useAudioPlayer(item.uri)
  const status = useAudioPlayerStatus(player)
  const handlePlayerButton = () => {
    if (status.currentTime === status.duration || status.didJustFinish) {
      player.seekTo(0)
    }
    player.play();
  }
  return (
    <View className="pb-1">
      <View className="flex-row gap-2 items-center">
        {status.playing === false ?
          <IconButton onPress={handlePlayerButton}>
            <MaterialCommunityIcons name="play" size={24} color={isDarkMode ? "#aaa" : "#666"} />
          </IconButton>
          :
          <IconButton onPress={() => player.pause()}>
            <MaterialCommunityIcons name="pause" size={24} color={isDarkMode ? "#aaa" : "#666"} />
          </IconButton>
        }
        <View className="flex-1">
          <Waveform
            mode="static"
            // ref={ref}
            path={item.uri}
            candleSpace={2}
            candleWidth={4}
            scrubColor="white"
            onPlayerStateChange={playerState => console.log(playerState)}
            onPanStateChange={isMoving => console.log(isMoving)}
          />;
        </View >
      </View >
      {
        /*
          <Text className="text-slate-800 dark:text-slate-200">{JSON.stringify(status, null, 2)}</Text>
          */
      }
      <Text className="text-slate-800 dark:text-slate-200">{Math.floor(item.size / 1024) + "KB"}</Text>
    </View >
  )
}


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