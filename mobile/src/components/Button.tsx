import React from "react";
import { Pressable, Text } from "react-native";
import { Icon, type IconName } from "./Icon";
import { s } from "../styles";
const blue = "#1a4fa0";
export function Button({
  label,
  onPress,
  icon,
  secondary = false,
  dark = false,
}: {
  label: string;
  onPress: () => void;
  icon?: IconName;
  secondary?: boolean;
  dark?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        {
          backgroundColor: secondary ? (dark ? "#283952" : "#edf2f9") : blue,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      {icon && (
        <Icon
          name={icon}
          color={secondary ? (dark ? "#fff" : blue) : "#fff"}
          size={19}
        />
      )}
      <Text
        style={{
          color: secondary ? (dark ? "#fff" : blue) : "#fff",
          fontSize: 15,
          fontWeight: "700",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
