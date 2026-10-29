import { IOVisualCostants } from "@io-app/design-system";
import { Platform, ScrollViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type FooterActionsInsetOptions = {
  bottomInset?: number;
  contentInsetAdjustmentBehavior?: ScrollViewProps["contentInsetAdjustmentBehavior"];
};

type FooterActionsMargin = {
  bottomMargin: number;
  contentBottomMargin: number;
  needSafeAreaMargin: boolean;
};

/**
 * A custom React Hook that returns the bottom margin value after taking into
 * consideration the safe area insets and the need to include a default margin
 * or not.
 *
 * Depending on those conditions, it returns these values:
 *
 * - `bottomMargin`: the amount of space to add just before the end of the actions
 *   block.
 * - `contentBottomMargin`: the scroll content spacing, excluding the native
 *   bottom inset when UIKit already applies it automatically.
 * - `needSafeAreaMargin`: a boolean value that indicates if the safe area insets
 *   are needed. We expose this value in case of need.
 *
 * Pass `bottomInset` for content behind a native tab bar. Its measured height
 * already includes the device safe area and replaces it rather than adding to
 * it.
 */
export const useFooterActionsMargin = (
  excludeSafeAreaMargins?: boolean,
  {
    bottomInset,
    contentInsetAdjustmentBehavior
  }: FooterActionsInsetOptions = {}
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
    bottomInset !== undefined
      ? bottomInset + IOVisualCostants.appMarginDefault
      : !needSafeAreaMargin || excludeSafeAreaMargins
        ? IOVisualCostants.appMarginDefault
        : insets.bottom + edgeToEdgeMargin;
  const contentBottomMargin =
    bottomMargin -
    (Platform.OS === "ios" && contentInsetAdjustmentBehavior === "automatic"
      ? (bottomInset ?? 0)
      : 0);

  return {
    bottomMargin,
    contentBottomMargin,
    needSafeAreaMargin
  };
};
