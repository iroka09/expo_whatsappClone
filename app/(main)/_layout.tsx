
import { Tabs } from "expo-router";
import { View } from "react-native";
import CustomTabBar from '@/components/CustomTabBar';

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={props => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="updates" />
      <Tabs.Screen name="communities" />
      <Tabs.Screen name="calls" />
    </Tabs>
  )
}
