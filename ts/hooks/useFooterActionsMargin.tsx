import { IOVisualCostants } from "@pagopa/io-app-design-system";
import { Platform } from "react-native";
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

  /* When `edge-to-edge` on Android is enabled, the margin
  from the bottom of the screen is too small. This extra margin
  is applied to prevent to display the actions too close to the
  screen edge.
  This margin is a temporary workaround to be removed when
  this issue is fixed:
  https://github.com/AppAndFlow/react-native-safe-area-context/issues/603 */
  const edgeToEdgeMargin = Platform.OS === "ios" ? 0 : 8;

  /* Check if the iPhone bottom handle is present.
     If not, or if you don't need safe area insets,
     add a default margin to prevent the button
     from sticking to the bottom. */
  const bottomMargin =
    !needSafeAreaMargin || excludeSafeAreaMargins
      ? IOVisualCostants.appMarginDefault
      : insets.bottom + edgeToEdgeMargin;

  return {
    bottomMargin,
    needSafeAreaMargin
  };
};
