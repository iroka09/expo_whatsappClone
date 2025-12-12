
import { ComponentProps } from "react"
import { View, Text } from "react-native";
import { BorderlessButton } from 'react-native-gesture-handler';
import * as React from 'react';


type IconButtonType = ComponentProps<typeof BorderlessButton>


export default function IconButton({ children, style = {}, containerStyle = {}, containerClassName = "", containerProps = {}, ...props }: IconButtonType) {
  return (
    <View
      className={"items-center justify-center overflow-hidden rounded-full" + containerClassName}// borderless=true works because of this patent's overflow-hidden and rounded-full, otherwise it will only show on the first ancestors in the tree of which this direct parent backgroundColor can make it invisible 
      style={[containerStyle]}
      {...containerProps}
    >
      <BorderlessButton style={[{ padding: 7 }, style]} rippleColor="#9995" {...props}>
        <View assesibility assesibilityRole="button">{children}</View>
      </BorderlessButton >
    </View>
  )
}