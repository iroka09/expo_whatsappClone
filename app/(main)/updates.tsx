import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { KeyboardAwareScrollView, KeyboardToolbar } from 'react-native-keyboard-controller';


export default function RegistrationForm() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    confirmPassword: "",
    address: "",
    city: "",
    country: "",
  });

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = () => {
    console.log("Submitted form:", form);
    alert("Submitted form");
  };

  return (
    <KeyboardAwareScrollView
      bottomOffset={62}
      contentContainerStyle={{
        flex: 1
      }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Registration Form</Text>
        {Object.keys(form).map((field) => (
          <TextInput
            key={field}
            placeholder={field.replace(/([A-Z])/g, " $1")}
            placeholderTextColor="#777"
            value={form[field]}
            onChangeText={(text) => handleChange(field, text)}
            style={styles.input}
          />
        ))}
        <Pressable
          android_ripple={{ color: "black" }}
          style={styles.button}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>Submit</Text>
        </Pressable>
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: "#000",
  },
  button: {
    backgroundColor: "black",
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
});