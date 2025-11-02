import React, { memo, useState, useCallback, useEffect, useRef } from "react";
import { View, Text, Pressable, TextInput, ScrollView, FlatList, StyleSheet, Image, Vibration, Alert, Platform, useColorScheme, BackHandler, TouchableWithoutFeedback, Dimensions } from "react-native";
import { Camera, Search, Plus, ArchiveRestore, CheckCheck, Check, EllipsisVertical, Pin, ArrowLeft, BellOff } from "lucide-react-native"
import IconButton from "@/components/IconButton"
import ImageZoom from "@/components/ImageZoom"
import { WebText } from "@/components/WebTags"
import { Portal } from "@/components/Portal"
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { toggleChatsSelection } from "@/redux/reducers/chats_tab_reducer";
import constants from "@/data/constants.json"
import chats from "@/data/chats.json"
import RippleButton from "react-native-advanced-ripple"
import { useRouter } from "expo-router"
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate, measure, useAnimatedRef } from "react-native-reanimated"
import { runOnUI, runOnJS } from "react-native-worklets"
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ScreenCapture from 'expo-screen-capture';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomSheet, { BottomSheetScrollView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";





const _Animated = {
  Image: Animated.createAnimatedComponent(Image),
  Text: Animated.createAnimatedComponent(Text),
}


type ChatsType = {
  id: number;
  name: string | null;
  phone: string;
  avatar: string;
  lastMessage: {
    text: string;
    fromMe: boolean;
    status?: "sent" | "delivered" | "read";
  },
  date: string;
  hasStatus: boolean;
  unreadCount: number;
}[]


const {
  paddingHorizontal,
  colors: {
    themes: {
      light: { primary, secondary: light_secondary, background: backgroundLight },
      dark: { secondary: dark_secondary, background: backgroundDark }
    }
  }
} = constants


//"modal animations"
const durationIn = 300;
const durationOut = 200;
const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');
const modalImageBoxMarginHorizontal = 50;
const modalImageBoxWidth = screenWidth - (2 * modalImageBoxMarginHorizontal)
const modalImageBottomBarHeight = 40;
const modalImageAspectRatio = 10 / 10
const modalImageBoxHeight = (modalImageBoxWidth / modalImageAspectRatio) + modalImageBottomBarHeight
const modalImageBoxInitialBorderRadius = 25;
const modalImageBoxFinalBorderRadius = 0;



export default function App() {
  const safeAreaInsets = useSafeAreaInsets()
  const selectedChatsIds = useSelector((state: RootState) => state.chats.selectedChatsIds);
  const bottomSheetRef = useRef<BottomSheet>(null)
  const router = useRouter()
  const isDarkMode = useColorScheme() === "dark"
  const [userImageModalObj, setUserImageModalObj] = useState<{
    username: string, image: string
  }>(null)
  const [modalImageViewState, setModalImageViewState] = useState<"closed" | "half-opened" | "fully-opened">("closed")
  const transition = useSharedValue(0)//012
  const profilePictureLayout = useSharedValue({})
  const dispatch = useDispatch<AppDispatch>();
  const openProfilePictureModalToFull = useCallback(() => {
    if (modalImageViewState !== "half-opened") return
    transition.value = withTiming(2, { duration: durationOut }, (finished) => {
      if (finished) runOnJS(setModalImageViewState)("fully-opened")
    })
  }, [modalImageViewState])
  const openProfilePictureModal = useCallback((user, imageBoxRef) => {
    setUserImageModalObj({ username: user.name || user.phone, image: user.avatar })
    runOnUI(() => {
      "worklet"
      profilePictureLayout.value = measure(imageBoxRef)
      transition.value = withTiming(1, { duration: durationIn }, (finished) => {
        if (finished) {
          runOnJS(setModalImageViewState)("half-opened")
        }
      })
    })()
  }, [])
  const closeProfilePictureModal = useCallback(() => {
    transition.value = withTiming(0, { duration: durationOut }, (finished) => {
      if (finished) {
        runOnJS(setUserImageModalObj)(null)
        runOnJS(setModalImageViewState)("closed")
      }
    })
  }, [])
  const overlayOpacityStyle = useAnimatedStyle(() => ({
    // opacity: transition.value,
    opacity: interpolate(transition.value, [0, 1, 2], [0, 0.6, 1])
  }))
  const fullscreenTitleOpacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(transition.value, [0, 1, 2], [0, 0, 1])
  }))
  const titleOpacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(transition.value, [0, 0.8, 1, 1.1], [0, 0, 1, 0]),
    transform: [{
      scaleY: interpolate(transition.value, [0, 1, 1.1], [0, 1, 0]),
    }]
  }))
  const modalImageBottomBarStyle = useAnimatedStyle(() => ({
    height: interpolate(transition.value, [0, 1, 1.01], [0, modalImageBottomBarHeight, 0], { extrapolateRight: "clamp" }),
    transform: [{
      scaleY: interpolate(transition.value, [0, 1, 1.01], [0, 1, 0], { extrapolateRight: "clamp" }),
    }]
  }))
  const modalImageBoxStyle_for_open = useAnimatedStyle(() => ({
    width: interpolate(transition.value, [0, 1, 2], [profilePictureLayout.value.width, modalImageBoxWidth, screenWidth]),
    height: interpolate(transition.value, [0, 1, 2], [profilePictureLayout.value.height, modalImageBoxHeight, screenWidth]),
    borderRadius: interpolate(transition.value, [0, 1, 2], [
      modalImageBoxInitialBorderRadius,
      modalImageBoxFinalBorderRadius,
      0
    ]),
    transform: [
      {
        translateX: interpolate(transition.value, [0, 1, 2], [profilePictureLayout.value.pageX, modalImageBoxMarginHorizontal, 0])
      },
      {
        translateY: interpolate(transition.value, [0, 1, 2], [profilePictureLayout.value.pageY, (screenHeight - screenWidth) / 3, (screenHeight - screenWidth) / 2]),
      }
    ]
  }))
  const modalImageBoxStyle_for_close = useAnimatedStyle(() => ({
    width: interpolate(transition.value, [0, 2], [profilePictureLayout.value.width, screenWidth]),
    height: interpolate(transition.value, [0, 2], [profilePictureLayout.value.height, screenWidth]),
    borderRadius: interpolate(transition.value, [0, 2], [
      modalImageBoxInitialBorderRadius,
      0
    ]),
    transform: [
      {
        translateX: interpolate(transition.value, [0, 2], [profilePictureLayout.value.pageX, 0])
      },
      {
        translateY: interpolate(transition.value, [0, 2], [profilePictureLayout.value.pageY, (screenHeight - screenWidth) / 2]),
      }
    ]
  }))
  useEffect(() => {
    if (Platform.OS === "web") return
    if (userImageModalObj)
      ScreenCapture.preventScreenCaptureAsync();
    else
      ScreenCapture.allowScreenCaptureAsync();
  }, [userImageModalObj])
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (modalImageViewState !== "closed") {
        closeProfilePictureModal()
        return true; // prevents app exit
      }
      if (selectedChatsIds.length > 0) {
        dispatch(toggleChatsSelection("clear"))
        return true; // prevents app exit
      }
      return false; //allow closing of app
    })
    return () => sub.remove()
  }, [modalImageViewState, selectedChatsIds.length])
  const [selectionEnabled, setSelectionEnabled] = useState(false)
  useEffect(() => {
    setSelectionEnabled(selectedChatsIds.length > 0)
  }, [selectedChatsIds.length])
  return (<>
    <View className="flex-1 bg-theme dark:bg-theme-dark">
      <HeaderBar bottomSheetRef={bottomSheetRef} />
      <FlatList
        className="flex-1"
        data={[{ JSX: <ListSearchAndFilters selectionEnabled={selectionEnabled} /> }, ...chats]}
        stickyHeaderIndices={[]}
        keyExtractor={item => item.id || "jsx"}
        renderItem={function ({ item }) {
          if (item.JSX) return item.JSX
          const isSelected = selectedChatsIds.includes(item.id)
          return (
            <ListItemOfUser
              item={item}
              openProfilePictureModal={openProfilePictureModal}
              isSelected={isSelected}
              selectionEnabled={selectionEnabled}
            />
          )
        }}
        ListFooterComponent={() => <Text className="text-slate-600 dark:text-slate-300 text-center py-4">Loading more...</Text>}
      />
    </View>
    {/*Portals*/}
    <Portal>
      {userImageModalObj ?
        <View style={{ position: "absolute", flex: 1, top: 0, right: 0, bottom: 0, left: 0 }}>
          <Animated.View
            style={[
              overlayOpacityStyle,
              {
                backgroundColor: "#000",
                position: "absolute",
                top: 0, right: 0, bottom: 0, left: 0,
              }
            ]}
          >
            <Pressable
              onPress={() => {
                if (modalImageViewState === "fully-opened") return
                closeProfilePictureModal()
              }}
              style={{
                position: "absolute",
                top: 0, right: 0, bottom: 0, left: 0,
              }}
            />
          </Animated.View>
          <Animated.View
            style={[
              fullscreenTitleOpacityStyle,
              {
                backgroundColor: "#000",
                position: "absolute",
                flexDirection: "row",
                alignItems: 'center',
                top: safeAreaInsets.top, right: 0, left: 0,
                paddingHorizontal: 5,
                paddingVertical: 3,
              }
            ]}
          >
            <IconButton
              onPress={() => {
                closeProfilePictureModal()
              }}
            >
              <ArrowLeft color="white" />
            </IconButton>
            <Text className="text-white text-2xl ml-3">{userImageModalObj.username}</Text>
          </Animated.View>
          <Animated.View
            style={[
              modalImageViewState === "fully-opened" ?
                modalImageBoxStyle_for_close :
                modalImageBoxStyle_for_open,
              {
                position: "relative",
                overflow: modalImageViewState === "fully-opened" ? "visible" : "hidden",
                backgroundColor: modalImageViewState === "fully-opened" ? undefined : (isDarkMode ? "#22222a" : backgroundLight)
              }
            ]}
          //   className="bg-theme dark:bg-theme-dark"
          >
            <Pressable onPress={openProfilePictureModalToFull} className="flex-1">
              <Image
                source={{ uri: userImageModalObj.image }}
                className="flex-1"
                resizeMode="cover"
              />
              {/*<ImageZoom enabled={modalImageViewState === "fully-opened"}>
                <Image
                  source={{ uri: userImageModalObj.image }}
                  className="flex-1"
                  resizeMode="cover"
                />
              </ImageZoom>*/}
            </Pressable>
            <Animated.View
              style={[
                modalImageBottomBarStyle,
                {
                  opacity: 1,
                  flexDirection: "row",
                  width: "100%",
                  justifyContent: "space-between",
                  paddingHorizontal: 20,
                  alignItems: "center",
                  overflow: "hidden"
                }
              ]}
            >
              <Pressable>
                <MaterialCommunityIcons name="message-text-outline" size={24} color={primary} />
              </Pressable>
              <Pressable>
                <MaterialCommunityIcons name="phone-outline" size={24} color={primary} />
              </Pressable>
              <Pressable>
                <MaterialCommunityIcons name="video-outline" size={24} color={primary} />
              </Pressable>
              <Pressable>
                <MaterialCommunityIcons name="information-outline" size={24} color={primary} />
              </Pressable>
            </Animated.View>
            <_Animated.Text
              style={[
                titleOpacityStyle,
                {
                  position: "absolute",
                  top: 0, width: "100%",
                  backgroundColor: "#0005",
                  color: "white",
                  fontSize: 25,
                  paddingHorizontal: 7,
                  paddingVertical: 2,
                }
              ]}
            >
              {userImageModalObj.username}
            </_Animated.Text>
          </Animated.View>
        </View>
        :
        null
      }
    </Portal >
    <Portal type="append">
      <RenderBottomSheet ref={bottomSheetRef} />
    </Portal>
  </>);
}




const HeaderBar = memo(({ bottomSheetRef }) => {
  const isDarkMode = useColorScheme() === "dark"
  const selectedChatsCount = useSelector((state: RootState) => state.chats.selectedChatsIds.length);
  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: isDarkMode ?
            (selectedChatsCount > 0 ? "#22222566" : undefined)
            :
            (selectedChatsCount > 0 ? "#eeea" : undefined)
        }
      ]}>
      {selectedChatsCount === 0 ? (<>
        <WebText tag="span" style={{ fontSize: 22, fontWeight: 800, opacity: .9, paddingLeft: paddingHorizontal }} className="text-primary dark:text-white">WhatsApp</WebText>
        <IconButton containerStyle={{ marginLeft: "auto" }}><Camera color={isDarkMode ? "white" : "black"} /></IconButton>
        <IconButton
          onPress={() => {
            bottomSheetRef.current?.snapToIndex(0)
          }}
          containerStyle={{ marginRight: 2 }}
        >
          <EllipsisVertical color={isDarkMode ? "white" : "black"} />
        </IconButton>
      </>)
        :
        (<>
          <IconButton containerStyle={{ marginLeft: 5 }}><ArrowLeft color={isDarkMode ? "white" : "black"} /></IconButton>
          <Text style={{ marginLeft: 10, fontSize: 22, fontWeight: 500, opacity: .9 }} className="dark:text-white">{selectedChatsCount}</Text>
          <IconButton containerStyle={{ marginLeft: "auto" }}><Pin color={isDarkMode ? "white" : "black"} /></IconButton>
          <IconButton><BellOff color={isDarkMode ? "white" : "black"} /></IconButton>
          <IconButton><ArchiveRestore color={isDarkMode ? "white" : "black"} /></IconButton>
          <IconButton
            onPress={() => {
              bottomSheetRef.current?.snapToIndex(0)
            }}
            containerStyle={{ marginRight: 2 }
            }
          >
            <EllipsisVertical color={isDarkMode ? "white" : "black"} />
          </IconButton>
        </>)
      }
    </View>
  )
})




const ListItemOfUser = memo(({ item, openProfilePictureModal, isSelected, selectionEnabled }) => {
  const isDarkMode = useColorScheme() === "dark"
  const dispatch = useDispatch<AppDispatch>();
  const _toggleChatsSelection = useCallback((id: number, vibrate = false) => {
    dispatch(toggleChatsSelection(id))
    vibrate && Vibration.vibrate(50)
  }, [])
  const imageBoxRef = useAnimatedRef()
  const scale = useSharedValue(0)
  const checkedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }))
  useEffect(() => {
    scale.value = withTiming(+isSelected, { duration: 200 })
  }, [isSelected])
  return (
    <Pressable
      delayLongPress={200}
      onLongPress={() => _toggleChatsSelection(item.id, !selectionEnabled)}
      onPress={() => {
        if (selectionEnabled) _toggleChatsSelection(item.id)
        else { }
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 10,
          paddingHorizontal,
          backgroundColor: isSelected ? (isDarkMode ? "#0645" : light_secondary) : undefined
        }}
      >
        <Pressable
          onLongPress={() => _toggleChatsSelection(item.id, !selectionEnabled)}
          onPress={() => {
            //  if (selectionEnabled) _toggleChatsSelection(item.id)
            openProfilePictureModal(item, imageBoxRef)
          }}
        >
          <View style={{ position: "relative" }}>
            <_Animated.Image
              ref={imageBoxRef}
              source={{ uri: item.avatar }}
              style={{
                width: 50,
                aspectRatio: 1,
                borderRadius: modalImageBoxInitialBorderRadius,
                marginRight: 10,
                backgroundColor: "gray"
              }}
            />
            <Animated.View style={[checkedStyle, { position: "absolute", bottom: -1, right: 6, padding: 3, backgroundColor: primary, marginLeft: "auto", borderRadius: 999, borderWidth: 2, borderColor: light_secondary }]}>
              <Check color={light_secondary} size={12} strokeWidth={3} />
            </Animated.View>
          </View>
        </Pressable>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row" }}>
            <Text style={{ flex: 1, fontSize: 18, fontWeight: 500 }} className="text-slate-800 dark:text-slate-200">{item.name || item.phone}</Text>
            <Text style={{ marginLeft: "auto", fontSize: 12, color: (!item.date.includes("/")) ? primary : (isDarkMode ? "#aaa" : undefined), textTransform: "capitalize" }} className="font-bold">{item.date}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {item.lastMessage.fromMe ? (
              item.lastMessage.status === "delivered" ?
                <Check size={17} style={{ marginRight: 6, color: isDarkMode ? "#aaa" : "#555" }} />
                :
                <CheckCheck size={17} style={{ marginRight: 6, color: item.lastMessage.status === "read" ? "#08f" : (isDarkMode ? "#aaa" : "#555") }} />
            )
              : null
            }
            <Text
              style={{
                fontSize: 14,
                color: item.lastMessage.text.toLocaleLowerCase() === "typing..." ? primary : (isDarkMode ? "#aaa" : "#555")
              }}
              numberOfLines={1}
              ellipsizeMode="clip"  // 'head' | 'middle' | 'tail' | 'clip'
            >
              {item.lastMessage.text}
            </Text>
            <View style={{ opacity: +(!!item.unreadCount), width: 20, aspectRatio: 1, justifyContent: "center", alignItems: "center", backgroundColor: primary, marginLeft: "auto", borderRadius: 999 }}>
              <Text style={{ color: "white", fontSize: 10 }}>{item.unreadCount}</Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  )
})





const ListSearchAndFilters = memo(({ selectionEnabled }) => {
  const isDarkMode = useColorScheme() === "dark"
  const [chatsFilter, setChatsFilter] = useState<string>("all")
  const unreadCount = useRef(chats.filter(x => x.unreadCount >= 1).length).current
  const filters = React.useMemo(() => (
    ["all", "unread " + unreadCount, "favourites", "groups " + 3, "add_more"]
  ), [unreadCount])
  return (<>
    <View
      style={{
        paddingHorizontal,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderRadius: 999,
          backgroundColor: isDarkMode ? "#eef2" : "#f0f3f5",
          paddingHorizontal: 15,
          paddingVertical: Platform.OS === "web" ? 10 : undefined
        }}
      >
        <Search color={isDarkMode ? "#aaa" : "#888"} />
        <TextInput
          className="flex-1 text-slate-500 ml-3 dark:text-slate-200 text-md outline-none"
          placeholder="Ask Meta Al or Search"
          placeholderTextColor={isDarkMode ? "#aaa" : "#888"}
        />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexDirection: "row", alignItems: "center" }}
        pointerEvents={selectionEnabled ? "none" : "auto"}
        opacity={selectionEnabled ? 0.5 : 1}
        className="relative"
      >
        {filters.map(txt => {
          let out;
          if (txt === "add_more") out = <Plus size={17} color={isDarkMode ? (txt.startsWith(chatsFilter) ? "#bdb" : "#aaa") : (txt.startsWith(chatsFilter) ? "#050" : "#888")} />
          else out = (
            <Text
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: isDarkMode ?
                  (txt.startsWith(chatsFilter) ? "#bdb" : "#aaa")
                  :
                  txt.startsWith(chatsFilter) ? "#050" : "#888",
              }}>
              {`${txt.charAt(0).toUpperCase()}${txt.slice(1).toLowerCase()}`}
            </Text>)
          return (
            <IconButton
              key={txt}
              chip
              containerStyle={{
                borderWidth: 1,
                borderColor: isDarkMode ? "#4446" : "#ddd",
                borderRadius: 999,
                marginVertical: 10,
                marginLeft: 5,
                paddingHorizontal: 4,
                backgroundColor: txt.startsWith(chatsFilter) ? (isDarkMode ? dark_secondary : light_secondary) : "transparent"
              }}
              pointerEvents={selectionEnabled ? "none" : "auto"}
              ripple_color={txt.startsWith(chatsFilter) ? "transparent" : light_secondary}
              onPress={() => {
                if (txt === "add_more") return
                setChatsFilter(txt.split(/\s/)[0])
              }}
            >
              {out}
            </IconButton>
          )
        })}
      </ScrollView>
    </View >
    <RippleButton >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 10,
          paddingHorizontal,
        }}
      >
        <ArchiveRestore color={isDarkMode ? "#aaa" : "#444"} style={{ marginLeft: 13 }} />
        <Text style={{ marginLeft: 22, fontWeight: 400, fontSize: 17 }} className="text-slate-800 dark:text-neutral-300">Archived</Text>
      </View>
    </RippleButton>
  </>)
})


const RenderBottomSheet = memo(React.forwardRef((props, ref) => {
  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={["30%"]}
      enableDynamicSizing={false}
      enablePanDownToClose
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior="close"
          opacity={.8}
          style={{
            backgroundColor: "black"
          }}
        />
      )}
      onChange={(index) => {
        //console.log("index is " + index)
      }}
    >
      <BottomSheetScrollView
        style={{ flex: 1 }}
      >
        {Array(15).fill().map((_, i) => (
          <Text key={i} style={{ fontSize: 30 }}>{i}</Text>
        ))}
      </BottomSheetScrollView>
    </BottomSheet>
  )
}))


const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 5,
    paddingBottom: 5,
    marginBottom: 10,
  },
  button: {
    padding: 20,
    borderRadius: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
    padding: 36,
    alignItems: 'center',
  },
});