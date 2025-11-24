import React, { useState } from 'react';
import { StatusBar, StyleSheet, Text, TouchableNativeFeedback, View, Image } from 'react-native';
// import mypic from "@/assets/images/me.jpg"



const TouchableNativeFeedbackEg = () => {
  const [rippleColor, setRippleColor] = useState(randomHexColor());
  const [rippleOverflow, setRippleOverflow] = useState(false);
  return (
    <View style={styles.container} className="bg-green-700/50">
      <TouchableNativeFeedback
        onPress={() => {
          setRippleColor(randomHexColor());
          setRippleOverflow(!rippleOverflow);
        }}
        background={TouchableNativeFeedback.Ripple(rippleColor, rippleOverflow)}>
        <View style={styles.touchable} className="relative">
          <Image source={require("@/assets/images/LC.png")} className="absolute top-0 left-0" />
          <Image source={{ uri: "me" }}className="absolute top-[100] left-0" />
          <Text style={styles.text}>TouchableNativeFeedback</Text>
        </View>
      </TouchableNativeFeedback>
    </View>
  );
};

const randomHexColor = () => {
  return '#000000'.replace(/0/g, function () {
    return (~~(Math.random() * 16)).toString(16);
  });
};
console.log("StatusBar.currentHeight", StatusBar.currentHeight)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: StatusBar.currentHeight,
    padding: 8,
  },
  touchable: { flex: 0.5, borderColor: 'black', borderWidth: 1 },
  text: { alignSelf: 'center' },
});

export default TouchableNativeFeedbackEg;
