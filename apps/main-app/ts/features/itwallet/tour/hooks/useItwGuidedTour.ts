import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback } from "react";
import { Dimensions, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { offlineAccessReasonSelector } from "../../../ingress/store/selectors";
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
  const offlineAccessReason = useIOSelector(offlineAccessReasonSelector);

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
    region: headerRegion,
    cutoutStyle: { cornerRadius: 0 }
  });

  /**
   * Starts the tour guide for the ITW on screen focus when:
   *
   * - ITW is active and valid
   * - Tour guide was not completed yet
   * - It is not in offline mode (no offline access reason set)
   */
  useFocusEffect(
    useCallback(() => {
      if (isItwActive && !isCompleted && !offlineAccessReason) {
        setTimeout(() => {
          // Adding a delay to make sure the tour starts after the navigation
          // transition and other animations are completed,
          dispatch(startTourAction({ groupId: ITW_TOUR_GROUP_ID }));
        }, 300);
      }
    }, [dispatch, isItwActive, isCompleted, offlineAccessReason])
  );
};
