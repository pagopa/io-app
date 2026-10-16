import { useState } from "react";
import { ViewStyle } from "react-native";

import { useIOTheme } from "../context";
import { IOColors } from "../core/IOColors";

const FOCUS_OUTLINE_WIDTH = 2;
const FOCUS_OUTLINE_OFFSET = 2;

/** Provides a layout-neutral indicator for native keyboard focus. */
export const useKeyboardFocus = (disabled = false) => {
  const theme = useIOTheme();
  const [focused, setFocused] = useState(false);

  const focusStyle: undefined | ViewStyle =
    focused && !disabled
      ? {
          outlineColor: IOColors[theme["interactiveElem-default"]],
          outlineWidth: FOCUS_OUTLINE_WIDTH,
          outlineOffset: FOCUS_OUTLINE_OFFSET,
          outlineStyle: "solid"
        }
      : undefined;

  return {
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    focusStyle
  };
};
