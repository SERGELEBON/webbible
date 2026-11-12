import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
export type IconName = React.ComponentProps<typeof Ionicons>["name"];
const blue = "#1a4fa0";
export function Icon({
  name,
  color = blue,
  size = 23,
}: {
  name: IconName;
  color?: string;
  size?: number;
}) {
  return <Ionicons name={name} size={size} color={color} />;
}
