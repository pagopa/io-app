import { IOText } from "@io-app/design-system";

import {
  DEFAULT_COLOR,
  DEFAULT_FONT_SIZE,
  DEFAULT_FONT_WEIGHT
} from "./constants";
import { AnimatedNumericTextProps } from "./types";

/**
 * Baseline implementation used on every platform but iOS.
 *
 * Jetpack Compose has no equivalent of SwiftUI's `contentTransition(.numericText)`,
 * so the value changes without a transition here. Replace this file with an
 * `AnimatedNumericText.android.tsx` if an Android-specific animation is added.
 */
export const AnimatedNumericText = ({
  accessibilityLabel,
  color = DEFAULT_COLOR,
  formatValue,
  size = DEFAULT_FONT_SIZE,
  value,
  weight = DEFAULT_FONT_WEIGHT
}: AnimatedNumericTextProps) => (
  <IOText
    accessibilityLabel={accessibilityLabel}
    color={color}
    size={size}
    weight={weight}
  >
    {formatValue ? formatValue(value) : String(value)}
  </IOText>
);
