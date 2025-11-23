import { useRef, useImperativeHandle, useCallback, forwardRef, memo } from "react";
import { Dimensions } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, useDerivedValue, useAnimatedRef, measure } from "react-native-reanimated";
import { runOnUI, runOnJS } from "react-native-worklets";



const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");




const AdvancedPinchPanZoom = forwardRef(({ children, enabled = false, style = {}, className = "", onBackPress }, ref) => {
  const inZoomRef = useRef(false);
  const animatedRef = useAnimatedRef()
  const updateZoomState = useCallback((val) => {
    inZoomRef.current = val;
  }, []);
  const boxLayout = useSharedValue();
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);
  const resetZoom = useCallback((scaleTo = 1) => {
    runOnUI((scaleTo) => {
      "worklet";
      scale.value = scaleTo;
      savedScale.value = scaleTo;
      translateX.value = 0;
      translateY.value = 0;
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
      focalX.value = 0;
      focalY.value = 0;
    })(scaleTo);
  }, []);
  useDerivedValue(() => {
    //== box size
    if (!boxLayout.value)
      boxLayout.value = measure(animatedRef)
    //== Zoom
    const inZoom = scale.value !== 1 || translateX.value !== 0 || translateY.value !== 0;
    runOnJS(updateZoomState)(inZoom);
  })
  useImperativeHandle(ref, () => ({
    resetZoom,
    get inZoom() {
      return inZoomRef.current
    }
  }));
  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (!enabled) return;
      if (scale.value > 0) {
        let increasedWidth = boxLayout.value.width * scale.value
        /*
        console.log("scale", scale.value)
        console.log("increasedWidth", increasedWidth)
        console.log("boxLayout width", boxLayout.value.width)
        console.log("boxLayout pageX", boxLayout.value.pageX)
        */
        let splitedOfWidthIncreament = (increasedWidth - boxLayout.value.width) / 2
        let movedLeft = boxLayout.value.pageX - splitedOfWidthIncreament
        let movedRight = splitedOfWidthIncreament
          - (SCREEN_WIDTH - (boxLayout.value.width + boxLayout.value.pageX))
        let tx = savedTranslateX.value + e.translationX;
        translateX.value = tx
        // console.log("movedLeft", movedLeft)
        //console.log("tx", tx)
        if (tx > 0 && tx > movedLeft) return
        let increasedHeight = boxLayout.value.width * scale.value
        let ty = savedTranslateY.value + e.translationY;
        translateY.value = ty
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });
  const pinch = Gesture.Pinch()
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((e) => {
      if (!enabled) return;
      focalX.value = e.focalX;
      focalY.value = e.focalY;
      let nextScale = savedScale.value * e.scale;
      nextScale = Math.max(1, Math.min(nextScale, 3));
      scale.value = nextScale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value < 1.02) {
        scale.value = withTiming(1);
        savedScale.value = 1;
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      }
    });
  const combinedGesture = Gesture.Simultaneous(pinch, pan);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: -focalX.value },
      { translateY: -focalY.value },
      { scale: scale.value },
      { translateX: focalX.value },
      { translateY: focalY.value },
      { translateX: translateX.value },
      { translateY: translateY.value }
    ]
  }));
  return (
    <GestureDetector gesture={combinedGesture}>
      <Animated.View
        ref={animatedRef}
        style={[animatedStyle, style]}
        className={"flex-1 " + className}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
})

export default memo(AdvancedPinchPanZoom);