import React from "react"
import { View, Button, useWindowDimensions } from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDecay,
  withSpring,
  cancelAnimation,
  runOnJS,
} from "react-native-reanimated"
import { Gesture, GestureDetector } from "react-native-gesture-handler"

export default function BouncingBall() {
  const { width, height } = useWindowDimensions()

  const BALL_SIZE = 80
  const boundX = width - BALL_SIZE
  const boundY = height - BALL_SIZE

  const x = useSharedValue(0)
  const y = useSharedValue(0)

  const startX = useSharedValue(0)
  const startY = useSharedValue(0)

  // Helps clamp & bounce motion
  const bounce = (value: number, min: number, max: number, velocity: number) => {
    "worklet"
    if (value < min) {
      return withDecay({ velocity: -velocity * 0.5 })
    } else if (value > max) {
      return withDecay({ velocity: -velocity * 0.5 })
    }
    return withDecay({ velocity })
  }

  const pan = Gesture.Pan()
    .onBegin(() => {
      cancelAnimation(x)
      cancelAnimation(y)
      startX.value = x.value
      startY.value = y.value
    })
    .onUpdate((e) => {
      x.value = Math.min(Math.max(startX.value + e.translationX, 0), boundX)
      y.value = Math.min(Math.max(startY.value + e.translationY, 0), boundY)
    })
    .onEnd((e) => {
      x.value = bounce(x.value, 0, boundX, e.velocityX)
      y.value = bounce(y.value, 0, boundY, e.velocityY)
    })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }))

  return (
    <View className="flex-1">
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            {
              width: BALL_SIZE,
              height: BALL_SIZE,
              borderRadius: BALL_SIZE / 2,
              backgroundColor: "red",
              position: "absolute",
            },
            animatedStyle,
          ]}
        />
      </GestureDetector>
      <Button title="reset" onPress={() => {
        x.value = withSpring(100)
        y.value = withSpring(100)
        startX.value = 0
        startY.value = 0
      }} />
    </View>
  )
}