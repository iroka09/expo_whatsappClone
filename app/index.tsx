
import { View, Text } from "react-native"
import { Redirect, Link } from "expo-router"
import { RectButton } from 'react-native-gesture-handler'


export default function App() {
  return <Redirect href="/chats" />
  return (
    <View className="flex-1 items-center justify-center">
      <RectButton>
        <Link href="/chats" asChild className="overflow-hidden rounded-full bg-slate-50" style={{ elevation: 3 }}>
          <Text>Go to /chats</Text>
        </Link>
      </RectButton>
    </View>
  )
}