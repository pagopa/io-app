import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IOSpacingScale, IOVisualCostants } from "../../../core";

/* Extra bottom margin for iPhone bottom handle because
   ButtonLink doesn't have a fixed height */
const extraSafeAreaMargin: IOSpacingScale = 8;

export const useBottomMargins = (
  withSecondaryAction: boolean = false,
  excludeSafeAreaMargins: boolean = false
) => {
  const insets = useSafeAreaInsets();
  const needSafeAreaMargin = insets.bottom !== 0;
  const edgeToEdgeMargin = Platform.OS === "ios" ? 0 : 8;

  /* Check if the iPhone bottom handle is present.
     If not, or if you don't need safe area insets,
     add a default margin to prevent the button
     from sticking to the bottom. */
  const bottomMargin =
    !needSafeAreaMargin || excludeSafeAreaMargins
      ? IOVisualCostants.appMarginDefault
      : insets.bottom + edgeToEdgeMargin;

  /* When the secondary action is visible, add extra margin
     to avoid little space from iPhone bottom handle */
  const extraBottomMargin =
    withSecondaryAction && needSafeAreaMargin ? extraSafeAreaMargin : 0;

  return { bottomMargin, extraBottomMargin };
};
