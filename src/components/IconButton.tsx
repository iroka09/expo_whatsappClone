import { ComponentProps } from "react"
import { View, ViewStyle, Pressable } from "react-native";
import RippleButton from "react-native-advanced-ripple"


type IconButtonType = ComponentProps<typeof View> & {
  chip?: boolean,
  ripple_color?: string,
  containerStyle?: ViewStyle,
  paddingHorizontal?: number
}


export default function IconButton({ children, containerStyle = {}, padding = 10, ripple_color = "#ccc", chip, onPress, onPressIn, onPressOut, onLongPress, ...props }: IconButtonType) {
  return (
    <View
      style={{
        borderRadius: 999,
        // borderWidth: 4,
        overflow: "hidden",
        ...containerStyle,
      }}
      {...props}
    >
      <RippleButton
        color={ripple_color}
        rippleSize={500}
        duration={1000}
        centered={false}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onLongPress={onLongPress}
      >
        <View
          style={{
            padding,
            justifyContent: "center",
            alignItems: "center",
            ...chip ? { paddingVertical: 6 } : {}
          }}
        >
          {children}
        </View>
      </RippleButton>
    </View>
  )
}