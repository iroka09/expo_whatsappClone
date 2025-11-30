import React, { useEffect, useState, useTransition, useDeferredValue } from 'react';
import { StatusBar, StyleSheet, Text, TouchableNativeFeedback, View, Image } from 'react-native';
// import mypic from "@/assets/images/me.jpg"



const TouchableNativeFeedbackEg = () => {
  const [rippleColor, setRippleColor] = useState(randomHexColor());
  const differedColor = useDeferredValue(rippleColor);
  const [isTranaitionPending, startTransition] = useTransition();
  const [rippleOverflow, setRippleOverflow] = useState(false);
  return (
    <View style={styles.container} className="bg-green-700/50">
      <Text className="text-3xl font-bold text-center my-5">   {rippleColor}  </Text>
      <Text className="text-3xl font-bold text-center my-5">   Differed: {differedColor}  </Text>
      <TouchableNativeFeedback
        onPress={() => {
          setRippleColor(randomHexColor());
          setRippleOverflow(!rippleOverflow);
          startTransition(() => {
            //alert("done")
          })
        }}
        //  background={TouchableNativeFeedback.Ripple(rippleColor, rippleOverflow)}
      >
        <View
          style={{
            backgroundColor: rippleColor,
            flex: 1,
          }}
          className="relative"
        >
          {isTranaitionPending && <Text className="font-bold text-center my-2">isTranaitionPending is true </Text>}
          <Image source={require("@/assets/images/LC.png")} className="absolute top-0 left-0 right-0 bottom-0" />
          <Image source={{ uri: "me" }} className="absolute top-[100] left-0" />
        </View>
      </TouchableNativeFeedback>
    </View >
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
  touchable: { flex: 0.5, borderColor: 'red', borderWidth: 1 },
  text: { alignSelf: 'center' },
});

export default TouchableNativeFeedbackEg;
