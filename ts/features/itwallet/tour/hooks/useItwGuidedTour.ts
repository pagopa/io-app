import { useHeaderHeight } from "@react-navigation/elements";
import I18n from "i18next";
import { useCallback, useEffect } from "react";
import { Dimensions, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { useGuidedTourRegion } from "../../../tour/components/useGuidedTourRegion";
import { startTourAction } from "../../../tour/store/actions";
import { isTourCompletedSelector } from "../../../tour/store/selectors";
import { itwIsL3EnabledSelector } from "../../common/store/selectors/preferences";
import {
  ITW_TOUR_GROUP_ID,
  ITW_TOUR_STEP_ADD_BUTTON
} from "../utils/constants";

export const useItwGuidedTour = () => {
  const dispatch = useIODispatch();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = Dimensions.get("window");
  const isItwActive = useIOSelector(itwIsL3EnabledSelector);
  const isCompleted = useIOSelector(state =>
    isTourCompletedSelector(state, ITW_TOUR_GROUP_ID)
  );

  const headerRegion = useCallback(
    () => ({
      x: 0,
      y: Platform.OS === "ios" ? insets.top : 0,
      width: screenWidth,
      height: headerHeight - insets.top
    }),
    [insets.top, screenWidth, headerHeight]
  );

  // Adds the tour guide feature to the header, highlighting the "Add" button
  useGuidedTourRegion({
    groupId: ITW_TOUR_GROUP_ID,
    index: ITW_TOUR_STEP_ADD_BUTTON,
    title: I18n.t("features.itWallet.tour.addCredential.title"),
    description: I18n.t("features.itWallet.tour.addCredential.description"),
    region: headerRegion
  });

  // Start the tour when the IT-Wallet is activated and user lands on the wallet
  // screen, if not already completed.
  useEffect(() => {
    if (isItwActive && !isCompleted) {
      dispatch(startTourAction({ groupId: ITW_TOUR_GROUP_ID }));
    }
  }, [dispatch, isItwActive, isCompleted]);
};
