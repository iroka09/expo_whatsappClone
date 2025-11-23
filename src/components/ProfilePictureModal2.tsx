import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, forwardRef } from 'react'
import { View, Text, Pressable, Image, ActivityIndicator, Platform, ToastAndroid, StyleSheet, Dimensions, BackHandler } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate, measure, useAnimatedRef, withDelay, Easing, runOnUI } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as ScreenCapture from 'expo-screen-capture'
import ImageZoom from '@/components/ImageZoom'
import { Portal } from '@/components/Portal'
import IconButton from '@/components/IconButton'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import constants from '@/data/constants.json'

// --------------------------- // Config / constants // ---------------------------
const { width: screenWidth, height: screenHeight } = Dimensions.get('screen')
const modalImageBoxMarginHorizontal = 50
const modalImageBoxWidth = screenWidth - (2 * modalImageBoxMarginHorizontal)
const modalImageBottomBarHeight = 40
const modalImageAspectRatio = 1 // square
const modalImageBoxHeight = (modalImageBoxWidth / modalImageAspectRatio) + modalImageBottomBarHeight
const durationIn = 200
const durationInFull = 200
const durationOut = 200
const LoadedHighQualityAvatar_StorageKey = 'LoadedHighQualityAvatar'

const { colors: { themes: { light: { primary, background: backgroundLight }, dark: { background: backgroundDark } } } } = constants

// --------------------------- // Small memoized subcomponents // ---------------------------
const BottomBar = React.memo(({ onPress }) => {
  return (
    <View style={styles.bottomBar}>
      <Pressable onPress={() => onPress?.('message')}>
        <MaterialCommunityIcons name="message-text-outline" size={24} color={primary} />
      </Pressable>
      <Pressable onPress={() => onPress?.('call')}>
        <MaterialCommunityIcons name="phone-outline" size={24} color={primary} />
      </Pressable>
      <Pressable onPress={() => onPress?.('video')}>
        <MaterialCommunityIcons name="video-outline" size={24} color={primary} />
      </Pressable>
      <Pressable onPress={() => onPress?.('info')}>
        <MaterialCommunityIcons name="information-outline" size={24} color={primary} />
      </Pressable>
    </View>
  )
})

const TitleBar = React.memo(({ username, onBack, opacityStyle }) => {
  return (
    <Animated.View
      style={[styles.fullscreenTitle, opacityStyle]}
    >
      <IconButton onPress={onBack}>
        <Text style={{ color: 'white' }}>‹</Text>
      </IconButton>
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={styles.titleText}
      >
        {username}
      </Text>
    </Animated.View>
  )
})

// --------------------------- // Helper utilities // ---------------------------
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

// --------------------------- // Main optimized modal // --------------------------- 
const ProfilePictureModal = forwardRef((props, ref) => {
  const safeArea = useSafeAreaInsets()
  const isDark = false // you can wire useColorScheme()

  // Shared values (keep modal view state on UI thread to avoid waking JS each frame)
  const progress = useSharedValue(0) // 0 closed, 1 half, 2 full 
  const userLayout = useSharedValue(null) // measured source small avatar layout 
  const modalLayout = useSharedValue(null) // measured modal box layout 
  const loadedHighQRef = useRef(new Set())

  // Refs and lightweight JS state kept in refs to avoid re-renders
  const visibleRef = useRef(false)
  const userObjRef = useRef(null) // { id, username, image } 
  const imageReloadingKeyRef = useRef(0)
  const retryTimerRef = useRef(null)
  const retryCallIdRef = useRef(0)
  const imageZoomRef = useRef(null)
  const modalBoxRef = useAnimatedRef()

  // Expose imperative API 
  useImperativeHandle(ref, () => ({ openModal: (user, smallImageRef) => openModal(user, smallImageRef), closeModal: (delay) => closeModal(delay), get viewState() { return progress.value } }), [])

  // --------------------------- // Minimal JS-visible states/actions // ---------------------------
  const setVisible = useCallback((v) => { visibleRef.current = v }, [])

  const saveLoaded = useCallback((url) => {
    loadedHighQRef.current.add(url)
    try { AsyncStorage.setItem(LoadedHighQualityAvatar_StorageKey, JSON.stringify(Array.from(loadedHighQRef.current))) }
    catch (e) { /* ignore */ }
  }, [])

  // --------------------------- // Open / close functions - minimize runOnJS usage // --------------------------- 
  const openModal = useCallback((user, smallImageRef) => { // set refs 
    userObjRef.current = user
    setVisible(true)

    // measure small image and the modal box on UI thread
    runOnUI(() => {
      'worklet'
      // measure small image (passed as a ref created via useAnimatedRef on parent)
      const small = smallImageRef ? measure(smallImageRef) : null
      userLayout.value = small
      // measure modal box (we'll measure it again onLayout inside component if null)
      // start half-open animation
      progress.value = withTiming(1, { duration: durationIn, easing: Easing.linear })
    })()

  }, [])

  const openFull = useCallback(() => {
    progress.value = withTiming(2, { duration: durationInFull, easing: Easing.linear }, () => {
      // no need to wake JS until we need to show spinner 
      // we can use a short runOnJS call to show spinner if desired
    }) 
  }, [])

      const closeModal = useCallback((delay = 0) => { // cancel retries retryCallIdRef.current = 0 if (retryTimerRef.current) { clearTimeout(retryTimerRef.current); retryTimerRef.current = null }

        // animate out and cleanup on finish
        progress.value = withDelay(delay, withTiming(0, { duration: durationOut, easing: Easing.linear }, (finished) => {
          if (finished) {
            runOnUI(() => { 'worklet' /* just ensure UI state closed */ })()
            runOnJS(setVisible)(false)
            userObjRef.current = null
          }
        }))

      }, [])

      // --------------------------- // Retry logic simplified + exponential backoff // --------------------------- 
      const retryImageLoading = useCallback((url, callId, attempt = 0) => {
        if (retryCallIdRef.current !== callId)
          return
        // simple exponential backoff
        const timeout = Math.min(30000, 1000 * Math.pow(2, attempt))
        Image.getSize(url,
          (w, h) => {
            saveLoaded(url)
            imageReloadingKeyRef.current = Math.random()
          },
          () => {
            if (retryCallIdRef.current !== callId) return
            if (attempt > 5) {
              // give up and notify 
              if (Platform.OS === 'android') ToastAndroid.show('Failed to load image', ToastAndroid.LONG)
              else alert('Failed to load image')
              return
            }
            retryTimerRef.current = setTimeout(() => retryImageLoading(url, callId, attempt + 1), timeout)
          }
        )
      }, [])

      // --------------------------- // Side-effects: back handler + screen capture // --------------------------- 
      useEffect(() => {
        const sub = BackHandler.addEventListener('hardwareBackPress', () => {
          if (progress.value !== 0) {
            // attempt to reset zoom before closing
            const z = imageZoomRef.current
            if (z?.inZoom) z.resetZoom()
            closeModal(z?.inZoom ? 100 : 0)
            return true
          }
          return false
        })
        return () => sub.remove()
      }, [])

      useEffect(() => { // read cached list into ref once (non-blocking) 
        (async () => {
          try {
            const val = await AsyncStorage.getItem(LoadedHighQualityAvatar_StorageKey)
            if (val) loadedHighQRef.current = new Set(JSON.parse(val))
          }
          catch (e) {
            /* ignore */
          }
        })()
      }, [])

      // prevent screen capture while modal visible
      useEffect(() => {
        // watch visibleRef via a polling effect is overkill; instead, show/hide on open/close calls // We'll implement a small watcher using a timer to reflect progress into JS visibility
        const interval = setInterval(() => {
          const visible = progress.value !== 0
          // Only call native screen-capture APIs when visible differs from our last known 
          if (visible !== visibleRef.current) {
            visibleRef.current = visible
            if (Platform.OS !== 'web') {
              if (visible) ScreenCapture.preventScreenCaptureAsync()
              else ScreenCapture.allowScreenCaptureAsync()
            }
          }
        }, 200)
        return () => clearInterval(interval)
      }, [])

      // --------------------------- // Animated styles (keep computations minimal) // --------------------------- 
      const backdropStyle = useAnimatedStyle(() => ({ opacity: interpolate(progress.value, [0, 1, 2], [0, 0.6, 1]) }))

      const fullscreenTitleOpacity = useAnimatedStyle(() => ({ opacity: interpolate(progress.value, [0.9, 1.5, 2], [0, 0, 1]) }))

      const titleOpacity = useAnimatedStyle(() => ({ opacity: interpolate(progress.value, [0, 0.8, 1, 1.1], [0, 0, 1, 0]) }))

      // Modal transform: precompute and use simple interpolations. Keep math cheap.
      const modalBoxStyle = useAnimatedStyle(() => {
        const m = modalLayout.value
        const s = userLayout.value
        if (!m) return { opacity: 0 }

        // defaults
        const width1 = m.width
        const height1 = m.height

        // fallback transforms
        let translateX0 = 0, translateY0 = 0, scaleX0 = 1, scaleY0 = 1

        if (s) {
          const width0 = s.width || 40
          const height0 = s.height || 40
          scaleX0 = (width0 / width1) || 1
          scaleY0 = (height0 / height1) || 1
          translateX0 = (s.pageX || 0) - (m.pageX || 0) - ((width1 - width0) / 2)
          translateY0 = (s.pageY || 0) - (m.pageY || 0) - ((height1 - height0) / 2)
        }

        const scaleX = interpolate(progress.value, [0, 1, 2], [scaleX0, 1, (screenWidth + 2) / width1])
        const scaleY = interpolate(progress.value, [0, 1, 2], [scaleY0, 1, (screenWidth + modalImageBottomBarHeight) / height1])
        const translateX = interpolate(progress.value, [0, 1, 2], [translateX0, 0, 0])
        const translateY = interpolate(progress.value, [0, 1, 2], [translateY0, 0, (((screenHeight - screenWidth) / 2) - (m.pageY || 0)) + ((screenWidth + modalImageBottomBarHeight - height1) / 2)])

        return {
          transform: [{ translateX }, { translateY }, { scaleX }, { scaleY }],
          borderRadius: interpolate(progress.value, [0, 1, 2], [width1 / 2, 0, 0]),
          overflow: progress.value < 2 ? 'hidden' : 'visible'
        }

      })

      const mainImageStyle = useAnimatedStyle(() => ({ borderRadius: interpolate(progress.value, [0, 0.3, 1, 2], [50, 0, 0, 0]), overflow: progress.value < 2 ? 'hidden' : 'visible' }))

      // --------------------------- // Render helpers // ---------------------------
      const getUsername = () => userObjRef.current?.username || ''
      const getLowUri = () => userObjRef.current?.image?.lowQuality || ''
      const getHighUri = () => userObjRef.current?.image?.highQuality || ''

      // Decide whether to show low-res layer: show only when progress < 2 
      const showLow = useMemo(() => {
        return true // UI decision; component will mount/unmount based on progress via animated styles
      }, [/* no deps */])

      // Handler from Image onError 
      const onHighImageError = useCallback(() => {
        const id = userObjRef.current?.id || Date.now()
        retryCallIdRef.current = id
        retryImageLoading(getHighUri(), id, 0)
      }, [])

      const onHighImageLoad = useCallback(() => saveLoaded(getHighUri()), [])

      // onLayout to measure modal box once 
      const onModalLayout = useCallback(() => {
        runOnUI(() => {
          'worklet'
          const m = measure(modalBoxRef)
          if (m) modalLayout.value = m
        })()
      }, [])

      // Handlers for toolbar 
      const onBottomAction = useCallback((action) => {
        // simple forwarding - keep expensive logic out of render 
        console.log('bottom action', action)
      }, [])

      // --------------------------- // JSX // --------------------------- 
      return (
        <Portal>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { opacity: visibleRef.current ? 1 : 0 }
            ]}
            pointerEvents={visibleRef.current ? 'auto' : 'none'}
          >
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => {
                if (progress.value !== 2)
                  closeModal()
              }}
            >
              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: '#000' },
                  backdropStyle
                ]}
              />
            </Pressable>

            <TitleBar
              username={getUsername()}
              onBack={() => {
                const z = imageZoomRef.current;
                if (z?.inZoom) z.resetZoom();
                closeModal(z?.inZoom ? 100 : 0)
              }}
              opacityStyle={fullscreenTitleOpacity}
            />

            <Animated.View
              ref={modalBoxRef}
              style={[
                { position: 'relative', width: modalImageBoxWidth, height: modalImageBoxHeight, top: ((screenHeight - screenWidth) / 3), left: modalImageBoxMarginHorizontal },
                modalBoxStyle
              ]}
              onLayout={onModalLayout}
            >

              <Pressable onPress={() => { if (progress.value < 2) openFull(); }} style={{ flex: 1 }}>

                {/* Low quality image when not fully opened - only mount when needed */}
                {progress.value < 2 && (
                  <Animated.View style={[StyleSheet.absoluteFill, mainImageStyle]}>
                    <ImageZoom enabled={false}>
                      <Image source={{ uri: getLowUri() }} style={styles.image} resizeMode="cover" />
                    </ImageZoom>
                  </Animated.View>
                )}

                {/* High quality image layer */}
                <Animated.View style={[mainImageStyle, { flex: 1 }]}>
                  <ImageZoom ref={imageZoomRef} enabled={progress.value === 2}>
                    <Image key={imageReloadingKeyRef.current} source={{ uri: getHighUri() }} style={styles.image} resizeMode="cover" onError={onHighImageError} onLoad={onHighImageLoad} />
                  </ImageZoom>
                </Animated.View>

              </Pressable>

              <Animated.Text style={[{ position: 'absolute', top: 0, width: '100%', backgroundColor: '#0005', color: 'white', fontSize: 25, paddingHorizontal: 7, paddingVertical: 2 }, titleOpacity]} numberOfLines={1} ellipsizeMode="tail">{getUsername()}</Animated.Text>

              {/* Bottom bar - keep simple and memoized */}
              <Animated.View style={[progress.value === 2 ? { display: 'none' } : undefined, styles.bottomBarContainer]}>
                <BottomBar onPress={onBottomAction} />
              </Animated.View>

            </Animated.View>
          </Animated.View>
        </Portal>

      )
    })

    export default ProfilePictureModal

    const styles = StyleSheet.create({
      image: {
        width: '100%',
        height: '100%'
      },
      bottomBar: {
        opacity: 1,
        flexDirection: 'row',
        width: '100%',
        height: modalImageBottomBarHeight,
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: backgroundLight
      },
      bottomBarContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0
      },
      fullscreenTitle: {
        backgroundColor: '#000',
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        top: 0,
        right: 0,
        left: 0,
        paddingHorizontal: 5,
        paddingVertical: 3
      },
      titleText: {
        color: 'white',
        fontSize: 20,
        marginLeft: 8,
        width: '50%'
      }
    }
    )