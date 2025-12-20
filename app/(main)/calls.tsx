import Swipeable  from 'react-native-gesture-handler/ReanimatedSwipeable';
import { View, Text, TouchableOpacity } from 'react-native';

const RightActions = () => (
  <View style={{ flexDirection: 'row' }} className="bg-purple-300">
    <TouchableOpacity style={{ backgroundColor: 'red', width: 80 }} className="justify-center">
      <Text className="text-center text-white">Delete</Text>
    </TouchableOpacity>
    <TouchableOpacity style={{ backgroundColor: 'blue', width: 80 }} className="justify-center">
      <Text className="text-center text-white">Edit</Text>
    </TouchableOpacity>
  </View>
);

export default function Item() {
  return (
    <Swipeable renderLeftActions={RightActions}>
      <View style={{ padding: 20 }} className="bg-slate-300">
        <Text>Swipe me to see other side of this view</Text>
      </View>
    </Swipeable>
  );
}