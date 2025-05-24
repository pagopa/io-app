import { IOVisualCostants } from "@pagopa/io-app-design-system";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type FooterActionsMargin = {
  bottomMargin: number;
  needSafeAreaMargin: boolean;
};

/**
 * A custom React Hook that returns the bottom margin value after taking
 * into consideration the safe area insets and the need to include
 * a default margin or not.
 *
 * Depending on those conditions, it returns two values:
 * - `bottomMargin`
 *    The amount of space to add just before the end of the actions block.
 * - `needSafeAreaMargin`
 *    A boolean value that indicates if the safe area insets are needed.
 *    We expose this value in case of need.
 */
export const useFooterActionsMargin = (
  excludeSafeAreaMargins?: boolean
): FooterActionsMargin => {
  const insets = useSafeAreaInsets();

  const needSafeAreaMargin = insets.bottom !== 0;

  /* Check if the iPhone bottom handle is present.
     If not, or if you don't need safe area insets,
     add a default margin to prevent the button
     from sticking to the bottom. */
  const bottomMargin =
    !needSafeAreaMargin || excludeSafeAreaMargins
      ? IOVisualCostants.appMarginDefault
      : insets.bottom;

  return {
    bottomMargin,
    needSafeAreaMargin
  };
};
