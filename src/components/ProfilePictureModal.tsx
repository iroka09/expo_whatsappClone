
import { useState, useEffect, useLayoutEffect, memo, useCallback, useMemo, useRef, useImperativeHandle, forwardRef } from "react"
import { View, Text, Pressable, TextInput, ScrollView, FlatList, StyleSheet, Image, Vibration, Alert, Platform, useColorScheme, BackHandler, Dimensions, ActivityIndicator, ToastAndroid, Modal } from "react-native";
import { Portal } from "react-native-paper";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate, measure, useAnimatedRef, useDerivedValue, Easing, withDelay, cancelAnimation } from "react-native-reanimated"
import { runOnUI, runOnJS } from "react-native-worklets"
import ImageZoom from "@/components/ImageZoom"
import AsyncStorage from '@react-native-async-storage/async-storage';
import IconButton from "@/components/IconButton"
import { Camera, Search, Plus, ArchiveRestore, CheckCheck, Check, EllipsisVertical, Pin, ArrowLeft, BellOff, Trash } from "lucide-react-native"
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ScreenCapture from 'expo-screen-capture';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import constants from "@/data/constants.json"




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
const durationIn = 200;
const durationIn_fullscreen = 200;
const durationOut = 200;
const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');
const modalImageBoxMarginHorizontal = 50;
const modalImageBoxWidth = screenWidth - (2 * modalImageBoxMarginHorizontal)
const modalImageBottomBarHeight = 40;
const modalImageAspectRatio = 10 / 10
const modalImageBoxHeight = (modalImageBoxWidth / modalImageAspectRatio) + modalImageBottomBarHeight
const modalImageBoxFinalBorderRadius = 0;
const LoadedHighQualityAvatar_StorageKey = "LoadedHighQualityAvatar"



const _Animated = {
  Image: Animated.createAnimatedComponent(Image),
  Text: Animated.createAnimatedComponent(Text),
  Pressable: Animated.createAnimatedComponent(Pressable)
}
Object.freeze(_Animated)

let n = 0

const ProfilePictureModal = forwardRef(({ modalImageBoxInitialBorderRadius }, ref) => {
  const [remount, setRemount] = useState()
  useEffect(() => {
    return
    //when app first mount,the animation box refuses to show sometimes but if remounted so that it can read the layouts of modalImageLayout, it shows
    setRemount(Math.random())
  }, [])
  const safeAreaInsets = useSafeAreaInsets()
  const isDarkMode = useColorScheme() === "dark"
  const userSmallLeftProfilePictureLayout = useSharedValue({})
  const [userImageModalObj, setUserImageModalObj] = useState<{
    id: number, name: string, avatar: ChatsType["avatar"]
  }>(null)
  const [loadedHighQualityAvatar, setLoadedHighQualityAvatar] = useState<string[]>([])
  const progress = useSharedValue(0)//012
  const [modalImageViewState, setModalImageViewState] = useState<"closed" | "half-opened" | "fully-opened">("closed")
  const imageZoomRef = useRef({})
  //==modal image layout measure
  const modalImageBoxRef = useAnimatedRef()
  const modalImageLayout = useSharedValue({})
  const [loadedLayouts, setLoadedLayouts] = useState(false)
  //===
  //==== retry image loading
  const [imageReloadingKey, setImageReloadingKey] = useState()
  const retryCallIdRef = useRef(0)
  const retryTimeoutRef = useRef()
  const [modalImageLoadingActivityIndicatorVisible, setModalImageLoadingActivityIndicatorVisible] = useState(false)
  const saveLoadedModalImage = (url: string) => {
    let data = [...new Set([...loadedHighQualityAvatar, url])]
    setLoadedHighQualityAvatar(data)
    AsyncStorage.setItem(LoadedHighQualityAvatar_StorageKey, JSON.stringify(data))
  }
  const retryImageLoading = useCallback(async (url: string, callId = 0, retryCount = 5) => {
    if (retryCallIdRef.current !== callId) {
      //two of them must be same. Reason, this will cancel previous trigger during new trigger
      clearTimeout(retryTimeoutRef.current)
      return
    }
    Image.getSize(url,
      () => {
        //success
        saveLoadedModalImage(url)
        if (retryCallIdRef.current !== callId) return
        setImageReloadingKey(Math.random())//remount the image for reloading sake
      },
      () => {
        //error
        if (retryCallIdRef.current !== callId) return
        if (retryCount === 0) {
          retryCount = Infinity
          setModalImageLoadingActivityIndicatorVisible(false)
          const msg = "Failed to update the profile picture, please try again later."
          if (Platform.OS === "android")
            ToastAndroid.show(msg, ToastAndroid.LONG)
          else alert(msg)
        }
        retryTimeoutRef.current = setTimeout(retryImageLoading, 1000, url, callId, --retryCount)
      }
    )
  }, [])
  //=====
  //=====open anim
  const openProfilePictureModal = useCallback((user, imageBoxRef) => {
    setUserImageModalObj({ id: user.id, name: user.name || user.phone, avatar: user.avatar })
    runOnUI(() => {
      "worklet"
      const val = measure(imageBoxRef)
      if (val) {
        userSmallLeftProfilePictureLayout.value = val
        progress.value = withTiming(1, { duration: durationIn, easing: Easing.linear }, finished => {
          if (finished) {
            runOnJS(setModalImageViewState)("half-opened")
          }
        })
      }
    })()
  }, [])
  const openProfilePictureModalToFull = useCallback(() => {
    progress.value = withTiming(2, { duration: durationIn_fullscreen, easing: Easing.linear }, finished => {
      if (finished) {
        runOnJS(setModalImageViewState)("fully-opened")
        runOnJS(setModalImageLoadingActivityIndicatorVisible)(true)
      }
    })
  }, [])
  const closeProfilePictureModal = useCallback((prop) => {
    let { delay = 0, animate = true } = prop || {}
    retryCallIdRef.current = 0
    setModalImageLoadingActivityIndicatorVisible(false)
    const closeFn = () => { setModalImageViewState("closed"); setUserImageModalObj(null) }
    const { resetZoom, inZoom } = imageZoomRef.current || {}
    if (inZoom) { resetZoom(); delay = 100 }
    if (animate)
      progress.value = withDelay(delay, withTiming(0, { duration: durationOut, easing: Easing.linear }, (finished) => { if (finished) runOnJS(closeFn)() }))
    else { progress.value = 0; closeFn() };

  }, [])
  const backdropOpacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1, 2], [0, 0.6, 1])
  }))
  const fullscreenTitleOpacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1, 1.5, 2], [0, 0, 0, 1])
  }))
  const halfScreenTitleOpacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.8, 1, 1.1], [0, 0, 1, 0])
  }))
  const modalImageBottomBarStyle_for_open = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.2, 0.3, 1, 1.01], [0, 1, 1, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" }),
  }))
  const modalImageBottomBarStyle_for_close = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.2, 0.3, 1.9, 2], [0, 1, 1, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" }),
  }))
  const mainModalImageStyle = useAnimatedStyle(() => {
    return ({
      borderRadius: interpolate(progress.value, [0, 0.3, 1, 2], [modalImageLayout.value?.width / 2, 0, 0, 0]),
      overflow: progress.value < 2 ? "hidden" : "visible",
      //opacity: interpolate(progress.value, [0, 0.01], [0, 1], { extrapolateRight: "clamp" }),
    })
  })
  const modalImageBoxStyle_for_open = useAnimatedStyle(() => {
    //== X ==
    const width0 = userSmallLeftProfilePictureLayout.value?.width
    const width1 = modalImageLayout.value?.width
    const width2 = screenWidth + 2
    const scaleX0 = width0 / width1
    const scaleX1 = 1
    const scaleX2 = width2 / width1
    const translateX0 = userSmallLeftProfilePictureLayout.value?.pageX - (modalImageLayout.value?.pageX + ((width1 - width0) / 2))
    const translateX1 = 0
    const translateX2 = 0
    //== Y ==
    const height0 = userSmallLeftProfilePictureLayout.value?.height + ((modalImageBottomBarHeight / (modalImageLayout.value?.height - modalImageBottomBarHeight)) * userSmallLeftProfilePictureLayout.value?.height);
    const height1 = modalImageLayout.value?.height
    const height2 = screenWidth + modalImageBottomBarHeight
    const scaleY0 = height0 / height1
    const scaleY1 = 1
    const scaleY2 = height2 / height1
    const translateY0 = userSmallLeftProfilePictureLayout.value?.pageY - (modalImageLayout.value?.pageY + ((height1 - height0) / 2))
    const translateY1 = 0;
    const translateY2 = (((screenHeight - screenWidth) / 2) - modalImageLayout.value?.pageY) + ((height2 - height1) / 2)
    const initialBorderRadius = (modalImageBoxInitialBorderRadius / width0) * width1
    return ({
      transform: [
        {
          translateX: interpolate(progress.value, [0, 1, 2], [translateX0, translateX1, translateX2])
        },
        {
          translateY: interpolate(progress.value, [0, 1, 2], [translateY0, translateY1, translateY2])
        },
        {
          scaleX: interpolate(progress.value, [0, 1, 2], [scaleX0, scaleX1, scaleX2])
        },
        {
          scaleY: interpolate(progress.value, [0, 1, 2], [scaleY0, scaleY1, scaleY2])
        }
      ],
      borderRadius: interpolate(progress.value, [0, 1, 2], [initialBorderRadius, 0, 0]),
      overflow: "hidden",
    })
  })
  const modalImageBoxStyleForClosingFullscreenView = useAnimatedStyle(() => {
    //== X ==
    const width0 = userSmallLeftProfilePictureLayout.value?.width
    const width1 = modalImageLayout.value?.width
    const width2 = screenWidth + 2
    const scaleX0 = width0 / width1
    const scaleX1 = 1
    const scaleX2 = width2 / width1
    const translateX0 = userSmallLeftProfilePictureLayout.value?.pageX - (modalImageLayout.value?.pageX + ((width1 - width0) / 2))
    const translateX1 = 0
    const translateX2 = 0
    //== Y ==
    const height0 = userSmallLeftProfilePictureLayout.value?.height + ((modalImageBottomBarHeight / (modalImageLayout.value?.height - modalImageBottomBarHeight)) * userSmallLeftProfilePictureLayout.value?.height);
    const height1 = modalImageLayout.value?.height
    const height2 = screenWidth + modalImageBottomBarHeight
    const scaleY0 = height0 / height1
    const scaleY1 = 1
    const scaleY2 = height2 / height1
    const translateY0 = userSmallLeftProfilePictureLayout.value?.pageY - (modalImageLayout.value?.pageY + ((height1 - height0) / 2))
    const translateY1 = 0;
    const translateY2 = (((screenHeight - screenWidth) / 2) - modalImageLayout.value?.pageY) + ((height2 - height1) / 2)
    const initialBorderRadius = (modalImageBoxInitialBorderRadius / width0) * width1
    return ({
      transform: [
        {
          translateX: interpolate(progress.value, [0, 2], [translateX0, translateX2])
        },
        {
          translateY: interpolate(progress.value, [0, 2], [translateY0, translateY2])
        },
        {
          scaleX: interpolate(progress.value, [0, 2], [scaleX0, scaleX2])
        },
        {
          scaleY: interpolate(progress.value, [0, 2], [scaleY0, scaleY2])
        }
      ],
      borderRadius: interpolate(progress.value, [0, 2], [initialBorderRadius, 0]),
      overflow: (progress.value < 2) ? "hidden" : "visible",
    })
  })
  useEffect(() => {
    //prevent screenshot when image is in view
    if (Platform.OS === "web") return
    if (userImageModalObj) ScreenCapture.preventScreenCaptureAsync();
    else ScreenCapture.allowScreenCaptureAsync();
  }, [userImageModalObj])
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      alert(modalImageViewState)
      if (modalImageViewState !== "closed") {
        closeProfilePictureModal()
        return true; // prevents app exit
      }
    })
    return () => sub.remove()
  }, [modalImageViewState])
  useEffect(() => {
    //get and check the already cached profile images from storage and check them
    (async () => {
      let val = await AsyncStorage.getItem(LoadedHighQualityAvatar_StorageKey)
      if (val) {
        val = JSON.parse(val)
        const imageUrls = await Promise.all(val.map(url => (
          new Promise((resolve, reject) => {
            Image.getSize(url,
              () => resolve(url),
              () => reject(null)
            )
          })
        ))).catch(() => null)
        setLoadedHighQualityAvatar(imageUrls ?? [])
      }
    })()
  }, [])
  useImperativeHandle(ref, () => ({
    openModal({ user, animatedRef: imageBoxRef }) {
      openProfilePictureModal(user, imageBoxRef)
    },
    closeModal(x) {
      closeProfilePictureModal(x)
    },
    get viewState() {
      return modalImageViewState
    }
  }))
  return (
    <Portal>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { opacity: userImageModalObj ? 1 : 0 }
        ]}
        pointerEvents={userImageModalObj ? "auto" : "none"}
       // className="bg-blue-700/50"
      >
        <Pressable
          onPress={() => {
            if (modalImageViewState !== "fully-opened")
              closeProfilePictureModal()
          }}
          style={{
            position: "absolute",
            top: 0, right: 0, bottom: 0, left: 0,
          }}
        >
          <Animated.View
            style={[
              backdropOpacityStyle,
              StyleSheet.absoluteFill,
              { backgroundColor: "#000" }
            ]}
          />
        </Pressable>
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
          <Text className="text-white text-2xl ml-3 w-[50%]" numberOfLines={1} ellipsizeMode="tail">{userImageModalObj?.name}</Text>
        </Animated.View>
        <Animated.View
          ref={modalImageBoxRef}
          style={[
            {
              position: "relative",
              width: modalImageBoxWidth,
              height: modalImageBoxHeight,
              top: ((screenHeight - screenWidth) / 3),
              left: modalImageBoxMarginHorizontal,
              //opacity: 0
            },
            loadedLayouts ?
              (modalImageViewState !== "fully-opened" ? modalImageBoxStyle_for_open : modalImageBoxStyleForClosingFullscreenView)
              :
              undefined,
          ]}
          onLayout={(e) => {
            runOnUI(() => {
              modalImageLayout.value = measure(modalImageBoxRef)
              runOnJS(setLoadedLayouts)(true)
            })()
          }}
        >
          <Pressable
            onPress={() => {
              openProfilePictureModalToFull()
            }}
            className="flex-1"
          >
            {(!loadedHighQualityAvatar.includes(userImageModalObj?.avatar.highQuality) || modalImageViewState !== "fully-opened") &&
              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  mainModalImageStyle
                ]}
              >
                <ImageZoom enabled={modalImageViewState === "fully-opened"}>
                  <Image
                    source={{ uri: userImageModalObj?.avatar.lowQuality + "" }}
                    className="flex-1"
                    resizeMode="cover"
                  />
                </ImageZoom>
                {modalImageLoadingActivityIndicatorVisible && <View className="absolute h-full w-full justify-center items-center">
                  <ActivityIndicator size={30} color={primary} />
                </View>}
              </Animated.View>
            }
            <Animated.View
              style={[mainModalImageStyle, { flex: 1 }]}
            >
              <ImageZoom enabled={modalImageViewState === "fully-opened"} ref={imageZoomRef}>
                <Image
                  key={imageReloadingKey}//helps to reload image when remounted after failure 
                  source={{ uri: userImageModalObj?.avatar.highQuality + "" }}
                  className="flex-1"
                  resizeMode="cover"
                  onLoad={() => {
                    saveLoadedModalImage(userImageModalObj?.avatar.highQuality)
                  }}
                  onError={() => {
                    let id = userImageModalObj?.id
                    retryCallIdRef.current = id
                    retryImageLoading(userImageModalObj?.avatar.highQuality, id)
                  }}
                />
              </ImageZoom>
            </Animated.View>
          </Pressable>
          <_Animated.Text
            style={[
              halfScreenTitleOpacityStyle,
              {
                position: "absolute",
                top: 0, width: "100%",
                backgroundColor: "#0005",
                color: "white",
                fontSize: 25,
                paddingHorizontal: 7,
                paddingVertical: 2
              }
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {userImageModalObj?.name}
          </_Animated.Text>
          <Animated.View
            style={[
              modalImageViewState === "fully-opened" ? //modalImageBottomBarStyle_for_close 
                undefined
                :
                modalImageBottomBarStyle_for_open
              ,
              {
                opacity: 1,
                flexDirection: "row",
                width: "100%",
                height: modalImageBottomBarHeight,
                justifyContent: "space-between",
                paddingHorizontal: 20,
                alignItems: "center",
                overflow: "hidden",
                backgroundColor: isDarkMode ? "#22222a" : backgroundLight
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
        </Animated.View>
      </Animated.View>
    </Portal>
  )
})

export default ProfilePictureModal