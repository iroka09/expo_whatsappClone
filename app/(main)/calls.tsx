
import { View, Pressable, Text, TextInput } from 'react-native';
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
//import { BorderlessButton } from 'react-native-gesture-handler';
import { useSafeArea } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import IconButton from '@/components/IconButton';
import { Camera } from "lucide-react-native"




export default function Calls({ name, onPress }) {
  const { top } = useSafeArea()
  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        justifyContent: "space-between"
      }}
      behavior="padding"
      keyboardVerticalOffset={top}
    >
      <View style={{ marginTop: 50, height: 80, backgroundColor: "red" }} className="justify-center items-center">
        <IconButton containerStyle={{ paddig: 0 }} style={{ backgroundColor: "pink", padding: 5 }} rippleColor="blue" borderless={true}>
          {/* <Text>Header</Text>*/}
          <Camera />
        </IconButton>
      </View>
      <TextInput placeholder="enter some text..." />
    </KeyboardAvoidingView>
  );
}