import { IOText } from "@io-app/design-system";

import {
  DEFAULT_COLOR,
  DEFAULT_FONT_SIZE,
  DEFAULT_FONT_WEIGHT
} from "./constants";
import { AnimatedNumericTextProps } from "./types";

/**
 * Static rendering of the value, with no transition between changes.
 *
 * Used as the baseline on every platform but iOS, and on iOS versions where
 * SwiftUI can't animate the digits. `IOText` already applies the Bold Text and
 * font size accessibility settings.
 */
export const BaselineNumericText = ({
  accessibilityLabel,
  allowFontScaling,
  color = DEFAULT_COLOR,
  formatValue,
  maxFontSizeMultiplier,
  size = DEFAULT_FONT_SIZE,
  value,
  weight = DEFAULT_FONT_WEIGHT
}: AnimatedNumericTextProps) => (
  <IOText
    accessibilityLabel={accessibilityLabel}
    allowFontScaling={allowFontScaling}
    color={color}
    maxFontSizeMultiplier={maxFontSizeMultiplier}
    size={size}
    weight={weight}
  >
    {formatValue ? formatValue(value) : String(value)}
  </IOText>
);
