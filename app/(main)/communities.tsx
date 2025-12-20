
import React, { lazy } from 'react';
import { View, Button, Alert, Text, Animated, StyleSheet, TextInput } from "react-native";
import { useKeyboardAnimation } from "react-native-keyboard-controller";
import { useAnimatedStyle } from "react-native-reanimated";
const Notifee = lazy(() => import('@/components/Notifee'))


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  row: {
    flexDirection: "row",
  },
});


function KeyboardAnimation() {
  const { height, progress } = useKeyboardAnimation();
  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2],
  });
  return (
    <View style={styles.container}>
      <View style={styles.row} className="flex-1 border-4 border-red-500 justify-center">
        <Animated.View
          style={{
            width: 50,
            height: 50,
            backgroundColor: "#17fc03",
            borderRadius: 15,
            // 2. we can apply any transformations we want
            transform: [{ translateY: height }, { scale }],
          }}
        />
      </View>
      <TextInput
        style={{
          width: "100%",
          marginTop: 50,
          height: 50,
          backgroundColor: "yellow",
        }}
      />
    </View>
  );
}


function App() {
  return (
    <View className="flex-1 justify-center gap-5">
      <KeyboardAnimation />
      <Notifee />
    </View>
  );
}

export default App