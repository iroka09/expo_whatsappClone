import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, StatusBar as RNStatusBar } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import * as SystemUI from "expo-system-ui";

// ----------------------------
// FULL VALID VALUES (Expo)
// ----------------------------
const NAV_VISIBILITY_VALUES: NavigationBar.Visibility[] = [
  "visible",
  "hidden",
  "leanback",
  "immersive",
  "sticky-immersive",
];

const NAV_BEHAVIOR_VALUES: NavigationBar.Behavior[] = [
  "overlay-swipe",
  "inset-swipe",
  "overlay-touch",
  "inset-touch",
];

export default function SystemUiAdvancedController() {
  const [statusVisible, setStatusVisible] = useState(true);
  const [systemBg, setSystemBg] = useState<string>(null);

  const [navVisibility, setNavVisibility] =
    useState<NavigationBar.Visibility>("visible");

  const [navBehavior, setNavBehavior] =
    useState<NavigationBar.Behavior>("overlay-swipe");

  // ----------------------------
  // APPLY NAVIGATION BAR MODE
  // ----------------------------
  useEffect(() => {
    const applyNav = async () => {
      try {
        await NavigationBar.setVisibilityAsync(navVisibility);
        await NavigationBar.setBehaviorAsync(navBehavior);
      } catch (err) {
        console.warn("NavigationBar not supported:", err);
      }
    };
    applyNav();
  }, [navVisibility, navBehavior]);

  // ----------------------------
  // APPLY SYSTEM BACKGROUND
  // ----------------------------
  useEffect(() => {
     if (systemBg === null) return
    SystemUI.setBackgroundColorAsync(systemBg);
  }, [systemBg]);

  return (
    <View
      style={{
        flex: 1,
        //  backgroundColor: systemBg,
        paddingHorizontal: 20,
        paddingTop: 60,
      }}
    >
      {/* STATUS BAR */}
      <StatusBar hidden={!statusVisible} />

      <Text
        style={{
          fontSize: 22,
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: 25,
        }}
      >
        🧭 System UI Advanced Controller
      </Text>

      {/* STATUS BAR TOGGLE */}
      <TouchableOpacity
        onPress={() => setStatusVisible((v) => !v)}
        style={{
          backgroundColor: "#007AFF",
          padding: 12,
          borderRadius: 10,
          marginBottom: 15,
        }}
      >
        <Text style={{ color: "white", textAlign: "center", fontSize: 16 }}>
          {statusVisible ? "Hide Status Bar" : "Show Status Bar"}
        </Text>
      </TouchableOpacity>

      {/* SYSTEM BACKGROUND */}
      <TouchableOpacity
        onPress={() => {
          setSystemBg((c) => ((c === "white" || c === null) ? "black" : "white"))
        }
        }
        style={{
          backgroundColor: "#34C759",
          padding: 12,
          borderRadius: 10,
          marginBottom: 25,
        }}
      >
        <Text style={{ color: "white", textAlign: "center", fontSize: 16 }}>
          Switch Background ({systemBg})
        </Text>
      </TouchableOpacity>

      {/* NAV BAR VISIBILITY */}
      <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 10 }}>
        Navigation Bar Visibility:
      </Text>

      <FlatList
        data={NAV_VISIBILITY_VALUES}
        horizontal
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setNavVisibility(item)}
            style={{
              backgroundColor:
                navVisibility === item ? "#FF9500" : "#D1D1D6",
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                color: navVisibility === item ? "white" : "black",
                fontWeight: "500",
              }}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* NAV BAR BEHAVIOR */}
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          marginTop: 25,
          marginBottom: 10,
        }}
      >
        Navigation Bar Behavior:
      </Text>

      <FlatList
        data={NAV_BEHAVIOR_VALUES}
        horizontal
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setNavBehavior(item)}
            style={{
              backgroundColor:
                navBehavior === item ? "#5856D6" : "#D1D1D6",
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                color: navBehavior === item ? "white" : "black",
                fontWeight: "500",
              }}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* CURRENT STATE */}
      <View style={{ marginTop: 40, alignItems: "center" }}>
        <Text style={{ fontSize: 16 }}>
          Status Bar: {statusVisible ? "Visible" : "Hidden"}
        </Text>
        <Text style={{ fontSize: 16 }}>NavBar Visibility: {navVisibility}</Text>
        <Text style={{ fontSize: 16 }}>NavBar Behavior: {navBehavior}</Text>
        <Text style={{ fontSize: 16 }}>System BG: {systemBg}</Text>
      </View>
    </View>
  );
}