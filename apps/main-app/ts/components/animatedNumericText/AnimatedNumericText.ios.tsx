import { Host, Text } from "@expo/ui/swift-ui";
import {
  accessibilityLabel as accessibilityLabelModifier,
  Animation,
  animation,
  contentTransition,
  fixedSize,
  font,
  foregroundStyle,
  monospacedDigit
} from "@expo/ui/swift-ui/modifiers";
import {
  IOColors,
  makeFontPostScriptName,
  useIONewTypeface
} from "@io-app/design-system";
import { useMemo } from "react";
import { Platform } from "react-native";

import { BaselineNumericText } from "./BaselineNumericText";
import {
  DEFAULT_COLOR,
  DEFAULT_FONT_SIZE,
  DEFAULT_FONT_WEIGHT
} from "./constants";
import { AnimatedNumericTextProps } from "./types";

/** Spring used for the digit transition, in seconds. */
const TRANSITION_SPRING = { response: 0.4, dampingFraction: 0.6 };

/**
 * Check if the current iOS version supports numeric text transition.
 * `Platform.Version` is typed as the union of every platform, a string on iOS */
const supportsNumericTextTransition = () =>
  parseInt(String(Platform.Version), 10) >= 16;

/**
 * The value is rendered by a SwiftUI `Text` so that each change animates through
 * `contentTransition(.numericText)`, the same effect the system uses for its own
 * timers.
 *
 * The text lives inside a `Host` boundary, outside the React Native text tree:
 * it cannot be nested in a sentence, it does not inherit `allowFontScaling` nor
 * the Bold Text accessibility setting, it needs its own accessibility label, and
 * the host must keep a stable size.
 */
const SwiftUINumericText = ({
  accessibilityLabel,
  color = DEFAULT_COLOR,
  countsDown = true,
  formatValue,
  size = DEFAULT_FONT_SIZE,
  value,
  weight = DEFAULT_FONT_WEIGHT
}: AnimatedNumericTextProps) => {
  const { newTypefaceEnabled } = useIONewTypeface();

  const modifiers = useMemo(
    () => [
      font({
        /* SwiftUI resolves a face by its PostScript name and ignores the
           `weight` parameter as soon as a custom family is given */
        family: makeFontPostScriptName(
          newTypefaceEnabled ? "Titillio" : "TitilliumSansPro",
          weight
        ),
        size
      }),
      foregroundStyle(IOColors[color]),
      accessibilityLabelModifier(accessibilityLabel),
      contentTransition("numericText", { countsDown }),
      animation(Animation.spring(TRANSITION_SPRING), value),
      /* Keeps every digit the same width, so the text does not jitter as the value changes */
      monospacedDigit(),
      /* SwiftUI would otherwise compress the text to the width proposed by the
         host and truncate it, where a React Native text keeps its full size */
      fixedSize({ horizontal: true })
    ],
    [
      accessibilityLabel,
      color,
      countsDown,
      newTypefaceEnabled,
      size,
      value,
      weight
    ]
  );

  return (
    /* The host hugs the SwiftUI content on both axes. Every measured change
       pushes a new size into the RN shadow tree, but `monospacedDigit` keeps
       the width stable until the number of characters itself changes */
    <Host matchContents>
      <Text modifiers={modifiers}>
        {formatValue ? formatValue(value) : String(value)}
      </Text>
    </Host>
  );
};

/**
 * iOS implementation.
 *
 * Below iOS 16 SwiftUI cannot animate the transition, so we rely
 * on the `IOText` component instead.
 */
export const AnimatedNumericText = (props: AnimatedNumericTextProps) =>
  supportsNumericTextTransition() ? (
    <SwiftUINumericText {...props} />
  ) : (
    <BaselineNumericText {...props} />
  );
