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
 * SwiftUI can't animate the digits.
 */
export const BaselineNumericText = ({
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
