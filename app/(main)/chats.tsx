import React, { lazy, memo, useState, useCallback, useEffect, useRef, useMemo, useLayoutEffect } from "react";
import { View, Text, TextInput, ScrollView, FlatList, StyleSheet, Image, Vibration, Pressable, Alert, Platform, useColorScheme, BackHandler, Dimensions, ActivityIndicator, ToastAndroid, Modal } from "react-native";
import { BaseButton } from "react-native-gesture-handler";
import { Camera, Search, Plus, ArchiveRestore, CheckCheck, Check, EllipsisVertical, Pin, ArrowLeft, BellOff, Trash } from "lucide-react-native"
import IconButton from "@/components/IconButton"
import ProfilePictureModal from "@/components/ProfilePictureModal"
import RenderBottomSheet from "@/components/RenderBottomSheet"
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { toggleChatsSelection, handleMarkChatAsRead } from "@/redux/reducers/chats_tab_reducer"
import constants from "@/data/constants.json"
import { useRouter, usePathname } from "expo-router"
import Animated, { useAnimatedRef, FadeIn, FadeOut, ZoomIn, ZoomOut } from "react-native-reanimated"
import { StatusBar } from 'expo-status-bar';
import Popup from '@/components/PopupMenu';
import type BottomSheetType from "@gorhom/bottom-sheet";


const modalImageBoxInitialWidth = 50
const modalImageBoxInitialBorderRadius = modalImageBoxInitialWidth / 2


const _Animated = {
  Image: Animated.createAnimatedComponent(Image)
}
Object.freeze(_Animated)


const {
  paddingHorizontal,
  colors: {
    themes: {
      light: { primary, secondary: light_secondary, background: backgroundLight },
      dark: { secondary: dark_secondary, background: backgroundDark }
    }
  }
} = constants





const GlobalValuesSharerAndExecutor = React.forwardRef(({ profilePictureModalRef }, ref) => {
  const pathname = usePathname()
  useEffect(() => {
    if (pathname !== "/chats") {
      profilePictureModalRef.current.closeModal({ animate: false })
    }
  }, [pathname])
  React.useImperativeHandle(ref, () => ({
    get pathname() {
      return pathname
    }
  }))
  return null
})



let ss = 0

export default function App() {
  // console.log(++ss, "App()")
  const chats = useSelector((state: RootState) => state.chats.chatsList);
  const [isProfilePictureModalVisible, setIsProfilePictureModalVisible] = useState(true)
  const profilePictureModalRef = useRef({})
  const globalValuesSharerAndExecutorRef = useRef()
  const bottomSheetRef = useRef<BottomSheetType>(null)
  const moreChats = useMemo(() => {
    return []
    return ([
      ...chats.map(x => {
        let obj = { ...x }
        obj.id = +(obj.id + "1000")
        return obj
      }),
      ...chats.map(x => {
        let obj = { ...x }
        obj.id = +(obj.id + "2000")
        return obj
      }),
      ...chats.map(x => {
        let obj = { ...x }
        obj.id = +(obj.id + "3000")
        return obj
      }),
      ...chats.map(x => {
        let obj = { ...x }
        obj.id = +(obj.id + "4000")
        return obj
      }),
      ...chats.map(x => {
        let obj = { ...x }
        obj.id = +(obj.id + "5000")
        return obj
      }),
    ])
  }, [])
  return (<>
    <GlobalValuesSharerAndExecutor
      ref={globalValuesSharerAndExecutorRef} //return value or exec
      profilePictureModalRef={profilePictureModalRef}//exec
    />
    <View className="flex-1 bg-theme dark:bg-theme-dark">
      <HeaderBar bottomSheetRef={bottomSheetRef} />
      <FlatList
        className="flex-1"
        data={[
          ...chats,
          ...moreChats
        ]}
        stickyHeaderIndices={[]}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ListItemOfUser
            item={item}
            profilePictureModalRef={profilePictureModalRef}
            globalValuesSharerAndExecutorRef={globalValuesSharerAndExecutorRef}
          />
        )}
        ListHeaderComponent={() => <ListSearchAndFilters />}
        ListFooterComponent={() => (
          <View className="flex-row justify-center border-t-[1px] mt-2 border-t-gray-500/20 pt-5 h-40 text-center py-4">
            <Text
              className="text-sm text-neutral-600 dark:text-neutral-400"
              numberOfLines={1}
            >
              Your personal messages are
              <Text style={{ color: primary }} className=" text-bold"> end-to-end-encrypted</Text>
            </Text>
          </View>
        )}
      />
    </View>
    <ProfilePictureModal
      ref={profilePictureModalRef}
      modalImageBoxInitialBorderRadius={modalImageBoxInitialBorderRadius}
    />
    <RenderBottomSheet ref={bottomSheetRef} />
  </>);
}




const HeaderBar = ({ bottomSheetRef }) => {
  const isDarkMode = useColorScheme() === "dark"
  const selectedChatsIds = useSelector((state: RootState) => state.chats.selectedChatsIds);
  const pathname = usePathname()
  const dispatch = useDispatch<AppDispatch>();
  const bgObj = useMemo(() => ({
    backgroundColor: isDarkMode ?
      (selectedChatsIds.length > 0 ? "#22222566" : undefined)
      :
      (selectedChatsIds.length > 0 ? "#eeea" : undefined)
  }), [isDarkMode])
  useEffect(() => {
    if (pathname !== "/chats") dispatch(toggleChatsSelection("clear"))
  }, [pathname])
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (selectedChatsIds.length > 0) {
        dispatch(toggleChatsSelection("clear"))
        return true; // prevents app exit
      }
      return false; //allow closing of app
    })
    return () => sub.remove()
  }, [selectedChatsIds])
  return (<>
    <View
      style={[styles.header]}>
      {selectedChatsIds.length === 0 ? (
        <Animated.View
          key="zero-count"
          entering={FadeIn}
          exiting={FadeOut}
          className="flex-1 flex-row items-center pt-3 pb-1"
        >
          <Text style={{ fontSize: 22, fontWeight: 800, opacity: .9, paddingLeft: paddingHorizontal }} className="text-primary dark:text-white">WhatsApp</Text>
          <IconButton containerStyle={{ marginLeft: "auto" }}>
            <Camera color={isDarkMode ? "white" : "black"} />
          </IconButton>
          <AddPopup />
        </Animated.View>
      ) : (
        <Animated.View
          key="above-zero-count"
          entering={FadeIn}
          exiting={FadeOut}
          className="flex-1 flex-row items-center pt-3 pb-1"
          style={bgObj}
        >
          <IconButton style={{ marginLeft: 5 }}><ArrowLeft color={isDarkMode ? "white" : "black"} /></IconButton>
          <Text style={{ marginLeft: 10, fontSize: 22, fontWeight: 500, opacity: .9 }} className="dark:text-white">{selectedChatsIds.length}</Text>
          <IconButton containerStyle={{ marginLeft: "auto" }}><Pin color={isDarkMode ? "white" : "black"} /></IconButton>
          {selectedChatsIds.some(x => x[1] === "group") || <IconButton ><Trash color={isDarkMode ? "white" : "black"} /></IconButton>}
          <IconButton><BellOff color={isDarkMode ? "white" : "black"} /></IconButton>
          <IconButton><ArchiveRestore color={isDarkMode ? "white" : "black"} /></IconButton>
          <IconButton
            onPress={() => {
              bottomSheetRef.current?.snapToIndex(0)
            }}
            style={{ marginRight: 2 }
            }
          >
            <EllipsisVertical color={isDarkMode ? "white" : "black"} />
          </IconButton>
        </Animated.View>)
      }
    </View >
  </>)
}


let n = 0
const ListItemOfUser = ({ item, profilePictureModalRef, globalValuesSharerAndExecutorRef }) => {
  // console.log(++n, ": ", item.name ?? item.phone)
  const router = useRouter()
  const unreadCount = useSelector((state: RootState) => state.chats.unreadCount.find(x => x.id === item.id)?.unreadCount)
  const isDarkMode = useColorScheme() === "dark"
  const isSelected = useSelector((state: RootState) => state.chats.selectedChatsIds.some(x => x[0] === item.id));
  const dispatch = useDispatch<AppDispatch>();
  const _toggleChatsSelection = useCallback((arr: [ChatsType["id"], ChatsType["type"]], vibrate = false) => {
    dispatch(toggleChatsSelection(arr))
    vibrate && Vibration.vibrate(50)
  }, [])
  const imageBoxRef = useAnimatedRef()
  const selectionEnabledRef = useRef(false)//to check if selection is enabled,note the value must be changed inside useSelector below in this component
  useSelector((state: RootState) => {
    selectionEnabledRef.current = state.chats.selectedChatsIds.length > 0
    return null
  });
  const isSelectionEnabled = useCallback(() => selectionEnabledRef.current, [])
  return (
    <BaseButton
      rippleColor="#99999955"
      //  cancelable
      delayLongPress={300}
      onLongPress={() => _toggleChatsSelection([item.id, item.type], !isSelectionEnabled())}
      onPress={() => {
        if (isSelectionEnabled()) _toggleChatsSelection([item.id, item.type])
        else {
          router.push(`/conversation/${item.id}`)
        }
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
        {/*User avatar*/}
        <BaseButton
          rippleColor="transparent"
          delayLongPress={300}
          onLongPress={() => _toggleChatsSelection([item.id, item.type], !isSelectionEnabled())}
          onPress={() => {
            if (globalValuesSharerAndExecutorRef.current.pathname==="/chats") {
              profilePictureModalRef.current.openModal({ user: item, animatedRef: imageBoxRef })
            }
          }}
        >
          <View style={{ position: "relative" }}>
            <_Animated.Image
              ref={imageBoxRef}
              source={{ uri: item.avatar.lowQuality }}
              style={{
                width: modalImageBoxInitialWidth,
                aspectRatio: 1,
                borderRadius: modalImageBoxInitialBorderRadius,
                marginRight: 10,
                backgroundColor: "gray"
              }}
            />
            {isSelected && <Animated.View entering={ZoomIn.duration(200)} exiting={ZoomOut.duration(200)} style={{ position: "absolute", bottom: -1, right: 6, padding: 3, backgroundColor: primary, marginLeft: "auto", borderRadius: 999, borderWidth: 2, borderColor: light_secondary }}>
              <Check color={light_secondary} size={12} strokeWidth={3} />
            </Animated.View>}
          </View>
        </BaseButton>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 4, alignItems: "center" }}>
            <Text
              style={{ flex: 1, fontSize: 18, fontWeight: 500, flexShrink: 1 }}
              className="text-slate-800 dark:text-slate-200"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.name ?? item.phone}
            </Text>
            <Text style={{ fontSize: 12, color: unreadCount ? primary : (isDarkMode ? "#aaa" : "#777"), textTransform: "capitalize" }} className="">{item.date}</Text>
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
                flexShrink: 1,//helps to avoid overflow during ellipsis
                color: item.lastMessage.text.toLocaleLowerCase() === "typing..." ? primary : (isDarkMode ? "#aaa" : "#555")
              }}
              numberOfLines={1}
              ellipsizeMode="tail" // 'head' | 'middle' | 'tail' | 'clip'
            >
              {item.lastMessage.text}
            </Text>
            {unreadCount && <Text style={{ color: "white", fontSize: 10, width: 20, aspectRatio: 1, textAlign: "center", verticalAlign: "middle", backgroundColor: primary, marginLeft: "auto", borderRadius: 999 }}>{unreadCount}</Text>}
          </View>
        </View>
      </View>
    </BaseButton>
  )
}





const ListSearchAndFilters = () => {
  const unreadCount = useSelector((state: RootState) => state.chats.unreadCount.length)
  const isDarkMode = useColorScheme() === "dark"
  const [chatsFilter, setChatsFilter] = useState<string>("all")
  const selectionEnabled = useSelector((state: RootState) => state.chats.selectedChatsIds.length > 0);
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
          backgroundColor: isDarkMode ? "#eee2" : "#f0f0f0",
          paddingHorizontal: 20,
          paddingVertical: Platform.OS === "web" ? 10 : 2,
          marginBottom: 5
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
        className="relative"
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexDirection: "row", alignItems: "center" }}
        pointerEvents={selectionEnabled ? "none" : "auto"}//in ScrollView it "none" prevents only scrolling
        opacity={selectionEnabled ? 0.5 : 1}
      >
        <View
          className="flex-row"
          pointerEvents={selectionEnabled ? "none" : "auto"}//this one prevents clicking
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
                borderless={false}
                containerStyle={{
                  marginVertical: 10,
                  marginLeft: 5,
                  borderWidth: 1,
                  borderColor: isDarkMode ? "#4446" : "#ddd",
                  backgroundColor: txt.startsWith(chatsFilter) ? (isDarkMode ? dark_secondary : light_secondary) : "transparent"
                }}
                style={{ paddingHorizontal: 8 }}
                rippleColor={txt.startsWith(chatsFilter) ? "transparent" : light_secondary}
                onPress={() => {
                  if (txt === "add_more") return
                  setChatsFilter(txt.split(/\s/)[0])
                }}
              >
                {out}
              </IconButton>
            )
          })}
        </View>
      </ScrollView>
    </View>
    <BaseButton
      rippleColor="#99999955"
      onPress={() => { }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 10,
          paddingHorizontal
        }}
      >
        <ArchiveRestore color={isDarkMode ? "#aaa" : "#444"} style={{ marginLeft: 13 }} />
        <Text style={{ marginLeft: 22, fontWeight: 400, fontSize: 17 }} className="text-slate-800 dark:text-neutral-300">Archived</Text>
      </View>
    </BaseButton>
  </>)
}


const AddPopup = () => {
  const isDarkMode = useColorScheme() === "dark"
  return (
    <Popup>
      <Popup.Trigger>
        <IconButton>
          <EllipsisVertical color={isDarkMode ? "white" : "black"} />
        </IconButton>
      </Popup.Trigger>
      <Popup.Options>
        {"rental car payment key table marriage".split(" ").map(text => (
          <Popup.Option
            key={text}
            onSelect={() => {
              // alert(text)
            }}
          >
            <Text style={{ textTransform: "capitalize" }} >{text}</Text>
          </Popup.Option>
        ))}
      </Popup.Options>
    </Popup>
  )
}



const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
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