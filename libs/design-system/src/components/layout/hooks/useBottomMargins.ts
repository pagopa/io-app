import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IODimensions } from "../../../core";

export const useBottomMargins = (
  withSecondaryAction = false,
  excludeSafeAreaMargins = false
) => {
  const insets = useSafeAreaInsets();
  const needSafeAreaMargin = insets.bottom !== 0;
  /* Temporary workaround: Android edge-to-edge insets leave the actions too
     close to the edge. Remove once this is fixed:
     https://github.com/AppAndFlow/react-native-safe-area-context/issues/603 */
  const androidInsetMargin = Platform.OS === "ios" ? 0 : 8;

  /* Check if the iPhone bottom handle is present.
     If not, or if you don't need safe area insets,
     add a default margin to prevent the button
     from sticking to the bottom. */
  const bottomMargin =
    !needSafeAreaMargin || excludeSafeAreaMargins
      ? IODimensions.padding.footer.edgeToEdge
      : insets.bottom + androidInsetMargin;

  /* When the secondary action is visible, add extra margin
     to avoid little space from iPhone bottom handle */
  const extraBottomMargin =
    withSecondaryAction && needSafeAreaMargin
      ? IODimensions.padding.footer.homeIndicator
      : 0;

  return { bottomMargin, extraBottomMargin };
};
