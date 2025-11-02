import React from "react";
import { Dimensions, View, StyleSheet } from "react-native";
import {
  GestureDetector,
  Gesture,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDecay
} from "react-native-reanimated";
import { runOnUI, runOnJS } from "react-native-worklets"
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");



export default function AdvancedPinchPanZoom({ children, enabled = false }) {
  //  if (!enabled) return children
  // Shared values
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  // --- PAN Gesture ---
  const pan = Gesture.Pan()
    .onUpdate((e) => {
      // Only allow pan if zoomed in
      if (scale.value > 1) {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      }
    })
    .onEnd((e) => {
    if(false){
      if (scale.value > 1) {
        // Continue panning a bit with momentum
        translateX.value = withDecay({
          velocity: e.velocityX,
          clamp: [-SCREEN_WIDTH, SCREEN_WIDTH],
        });
        translateY.value = withDecay({
          velocity: e.velocityY,
          clamp: [-SCREEN_HEIGHT, SCREEN_HEIGHT],
        });
      } else {
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
      }
      }
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // --- PINCH Gesture ---
  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      // Track pinch center
      focalX.value = e.focalX;
      focalY.value = e.focalY;

      // Apply limited scale
      let nextScale = savedScale.value * e.scale;
      nextScale = Math.max(1, Math.min(nextScale, 3)); // min=1, max=3
      scale.value = nextScale;
    })
    .onEnd(() => {
      // Save the last scale for reference
      savedScale.value = scale.value;

      // If below threshold, reset
      if (scale.value < 1.02) {
        scale.value = withTiming(1);
        savedScale.value = 1;
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      }
    });

  // Combine gestures
  const combinedGesture = Gesture.Simultaneous(pinch, pan);

  // --- Animated style ---
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      // 1. move focal to origin
      { translateX: -focalX.value },
      { translateY: -focalY.value },

      // 2. apply scale
      { scale: scale.value },

      // 3. move focal back
      { translateX: focalX.value },
      { translateY: focalY.value },

      // 4. apply pan translations
      { translateX: translateX.value },
      { translateY: translateY.value }
    ]
  }))
  // return children
  return (
    <GestureDetector gesture={combinedGesture}>
      <Animated.View
        style={[animatedStyle]}
        className="flex-1">
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
