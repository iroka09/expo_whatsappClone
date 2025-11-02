
import { Tabs } from "expo-router";
import { View } from "react-native";
import ContactAndAiButtons from '@/components/ContactAndAiButtons';
import CustomTabBar from '@/components/CustomTabBar';

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={props => (
        <View className="relative">
          <CustomTabBar {...props} />
          <ContactAndAiButtons />
        </View>
      )}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="updates" />
      <Tabs.Screen name="communities" />
      <Tabs.Screen name="calls" />
    </Tabs>
  )
}
