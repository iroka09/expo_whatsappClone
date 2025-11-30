import React, { lazy, memo, useState, useCallback, useEffect, useRef, useMemo, useLayoutEffect } from "react";
import { View, Text, Pressable, TextInput, ScrollView, FlatList, StyleSheet, Image, Vibration, Alert, Platform, useColorScheme, BackHandler, Dimensions, ActivityIndicator, ToastAndroid } from "react-native";
import { Camera, Search, Plus, ArchiveRestore, CheckCheck, Check, EllipsisVertical, Pin, ArrowLeft, BellOff, Trash } from "lucide-react-native"
import IconButton from "@/components/IconButton"
import ProfilePictureModal from "@/components/ProfilePictureModal"
import { Portal } from "@/components/Portal"
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { toggleChatsSelection } from "@/redux/reducers/chats_tab_reducer"
import constants from "@/data/constants.json"
import { chats, type ChatsType } from "@/components/ChatsList"
import { useRouter, usePathname } from "expo-router"
import Animated, { useAnimatedRef, FadeIn, FadeOut, ZoomIn, ZoomOut } from "react-native-reanimated"
import { StatusBar } from 'expo-status-bar';
import Popup from '@/components/PopupMenu';
import type BottomSheetType from "@gorhom/bottom-sheet";
const BottomSheet = lazy(() => import("@gorhom/bottom-sheet"));
const BottomSheetScrollView = lazy(() => import("@gorhom/bottom-sheet").then(x => ({ default: x.BottomSheetScrollView })));
const BottomSheetBackdrop = lazy(() => import("@gorhom/bottom-sheet").then(x => ({ default: x.BottomSheetBackdrop })))


const modalImageBoxInitialBorderRadius = 25;


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




let ss = 0

export default function App() {
  //  console.log(++ss, "App()")
  const profilePictureModalRef = useRef({})
  const bottomSheetRef = useRef<BottomSheetType>(null)
  const router = useRouter()
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
          />
        )}
        ListHeaderComponent={() => <ListSearchAndFilters />}
        ListFooterComponent={() => (
          <View className="flex-row justify-center border-t-[1px] mt-2 border-t-gray-500/20 pt-5 h-40 text-center py-4">
            <Text className="text-sm text-neutral-600 dark:text-neutral-400" >Your personal messages are
              <Text style={{ color: primary }} className="text-sm text-bold"> end-to-end-encrypted</Text>
            </Text>
          </View>
        )}
      />
    </View>
    <ProfilePictureModal
      ref={profilePictureModalRef}
      modalImageBoxInitialBorderRadius={modalImageBoxInitialBorderRadius}
    />
    <Portal type="append">
      <RenderBottomSheet ref={bottomSheetRef} />
    </Portal>
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
    if (pathname !== "/") dispatch(toggleChatsSelection("clear"))
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
          <IconButton containerStyle={{ marginLeft: "auto" }}><Camera color={isDarkMode ? "white" : "black"} /></IconButton>
          {/* <IconButton
            onPress={() => {
              bottomSheetRef.current?.snapToIndex(0)
            }}
            containerStyle={{ marginRight: 2 }}
          >
            <EllipsisVertical color={isDarkMode ? "white" : "black"} />
          </IconButton>*/}
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
          <IconButton containerStyle={{ marginLeft: 5 }}><ArrowLeft color={isDarkMode ? "white" : "black"} /></IconButton>
          <Text style={{ marginLeft: 10, fontSize: 22, fontWeight: 500, opacity: .9 }} className="dark:text-white">{selectedChatsIds.length}</Text>
          <IconButton containerStyle={{ marginLeft: "auto" }}><Pin color={isDarkMode ? "white" : "black"} /></IconButton>
          {selectedChatsIds.some(x => x[1] === "group") || <IconButton ><Trash color={isDarkMode ? "white" : "black"} /></IconButton>}
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
        </Animated.View>)
      }
    </View >
  </>)
}


let n = 0
const ListItemOfUser = ({ item, profilePictureModalRef }) => {
  //console.log(++n, ": ", item.name ?? item.phone)
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
    <Pressable
      delayLongPress={300}
      onLongPress={() => _toggleChatsSelection([item.id, item.type], !isSelectionEnabled())}
      onPress={() => {
        if (isSelectionEnabled()) _toggleChatsSelection([item.id, item.type])
        else { }
      }}
    >{({ pressed }) => (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 10,
          paddingHorizontal,
          backgroundColor: isSelected ? (isDarkMode ? "#0645" : light_secondary) : (pressed ? "#bbb3" : undefined)
        }}
      >
        {/*User avatar*/}
        <Pressable
          delayLongPress={300}
          onLongPress={() => _toggleChatsSelection([item.id, item.type], !isSelectionEnabled())}
          onPress={() => {
            profilePictureModalRef.current.openModal({user:item, animatedRef:imageBoxRef})
          }}
        >
          <View style={{ position: "relative" }}>
            <_Animated.Image
              ref={imageBoxRef}
              source={{ uri: item.avatar.lowQuality }}
              style={{
                width: 50,
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
        </Pressable>
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
            <Text style={{ fontSize: 12, color: (!!item.unreadCount) ? primary : (isDarkMode ? "#aaa" : "#777"), textTransform: "capitalize" }} className="">{item.date}</Text>
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
            <Text style={{ color: "white", fontSize: 10, opacity: +(!!item.unreadCount), width: 20, aspectRatio: 1, textAlign: "center", verticalAlign: "middle", backgroundColor: primary, marginLeft: "auto", borderRadius: 999 }}>{item.unreadCount}</Text>
          </View>
        </View>
      </View>
    )}
    </Pressable>
  )
}





const ListSearchAndFilters = () => {
  const isDarkMode = useColorScheme() === "dark"
  const [chatsFilter, setChatsFilter] = useState<string>("all")
  const selectionEnabled = useSelector((state: RootState) => state.chats.selectedChatsIds.length > 0);
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
        </View>
      </ScrollView>
    </View>
    <Pressable>
      {({ pressed }) => (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 10,
            paddingHorizontal,
            backgroundColor: pressed ? "#aaa3" : undefined
          }}
        >
          <ArchiveRestore color={isDarkMode ? "#aaa" : "#444"} style={{ marginLeft: 13 }} />
          <Text style={{ marginLeft: 22, fontWeight: 400, fontSize: 17 }} className="text-slate-800 dark:text-neutral-300">Archived</Text>
        </View>
      )}
    </Pressable>
  </>)
}


const AddPopup = () => {
  const isDarkMode = useColorScheme() === "dark"
  return (
    <Popup>
      <Popup.Trigger>
        <View className="px-3">
          <EllipsisVertical color={isDarkMode ? "white" : "black"} />
        </View>
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

const RenderBottomSheet = React.forwardRef((props, ref) => {
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
})


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