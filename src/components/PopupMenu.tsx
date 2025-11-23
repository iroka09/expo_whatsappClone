import React, { createContext, useContext, useState, useCallback } from "react";
import { View, Text, Modal, Pressable, TouchableOpacity, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate, measure, useAnimatedRef, FadeIn, FadeOut } from "react-native-reanimated"
import { runOnUI, runOnJS } from "react-native-worklets"



const _Animated = {
  Pressable: Animated.createAnimatedComponent(Pressable),
  //Text: Animated.createAnimatedComponent(Text),
}



const PopupContext = createContext(null);

const usePopup = () => {
  const ctx = useContext(PopupContext);
  if (!ctx) throw new Error("Popup compound components must be used within <Popup>");
  return ctx;
};

 function Popup({ children }) {
  const [open, setOpen] = useState(false);
  const triggerLayout = useSharedValue({})
  const progress = useSharedValue(0)
  const openPopup = useCallback((triggerRef) => {
    runOnUI(() => {
      'worklet';
      const layout = measure(triggerRef);
      if (layout) {
        triggerLayout.value = layout;
        runOnJS(setOpen)(true);
        progress.value = withTiming(1);
      }
    })();
  }, []);
  const closePopup = useCallback(() => {
    runOnUI(() => {
      "worklet"
      progress.value = withTiming(0, {}, (finished) => {
        if (finished) runOnJS(setOpen)(false)
      })
    })()
  }, []);
  const value = { open, closePopup, openPopup, triggerLayout, progress };
  return (
    <PopupContext.Provider value={value}>
      <View>{children}</View>
    </PopupContext.Provider>
  );
}

// ───────── Trigger ─────────
function Trigger({ children }) {
  const { openPopup } = usePopup();
  const triggerRef = useAnimatedRef()
  return (
    <_Animated.Pressable
      ref={triggerRef}
      style={{ padding: 5 }}
      onPress={() => {
        openPopup(triggerRef)
      }}
    >
      {children}
    </_Animated.Pressable>
  );
}

// ───────── Options ─────────
const OptionsWidth = 200
function Options({ children }) {
  const { open, closePopup, progress, triggerLayout } = usePopup();
  const [optionsContentHeight, setOptionsContentHeight] = useState(0)
  const optionsStyle = useAnimatedStyle(() => {
    return ({
      transform: [
        {
          translateX: (triggerLayout.value.pageX - 100) || 0
        },
        {
          translateY: interpolate(progress.value, [0, 1], [triggerLayout.value.pageY - 80, triggerLayout.value.pageY])
        },
        {
          scaleY: interpolate(progress.value, [0, 1], [0, 1])
        }
      ],
      opacity: progress.value,
      transformOrigin: "50% 0%"
    })
  })

  return (
    <Modal transparent visible={open} onRequestClose={closePopup}>
      <Pressable
        style={styles.backdrop}
        onPress={() => {
          // alert("outer pressed")
          //  closePopup()
        }}
        className="flex-row items-start"
      >
        <Animated.View
          style={[
            optionsStyle,
            {
              position: "relative",
              backgroundColor: "white",
              borderRadius: 3,
            }
          ]}
          className="shadow-lg"
        >
          {children}
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

// ───────── Option ─────────
function Option({ children, onSelect, closeOnSelect = true }) {
  const { closePopup } = usePopup();
  const handlePress = () => {
    onSelect?.();
    if (closeOnSelect) closePopup();
  };
  return (
    <TouchableOpacity onPress={handlePress} className="flex-row items-center justify-left gap-3 px-5 py-3">
      {children}
    </TouchableOpacity>
  );
}

export default Popup

// Attach subcomponents
Popup.Trigger = Trigger;
Popup.Options = Options
Popup.Option = Option

// ───────── Styles ─────────
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "#00000055",
  },
  inner: {
    padding: 10,
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
  },
  option: {
    paddingVertical: 10,
  },
});