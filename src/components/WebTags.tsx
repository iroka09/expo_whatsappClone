
import { Platform, View, Text } from "react-native"



export function WebText({ children, tag: Tag = "span", ...props }) {
  if (Platform.OS === "web")
    return (
      <Text {...props}>
        <Tag>{children}</Tag>
      </Text>
    )
  return <Text {...props}>{children}</Text>
}

export function WebView({ children, tag: Tag = "div", ...props }) {
  if (Platform.OS === "web")
    return (
      <View {...props}>
        <Tag>{children}</Tag>
      </View>
    )
  return <View {...props}>{children}</View>
}