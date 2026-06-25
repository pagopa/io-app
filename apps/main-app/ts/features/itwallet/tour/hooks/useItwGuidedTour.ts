import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { offlineAccessReasonSelector } from "../../../ingress/store/selectors";
import { startTourAction } from "../../../tour/store/actions";
import { isTourCompletedSelector } from "../../../tour/store/selectors";
import { itwIsL3EnabledSelector } from "../../common/store/selectors/preferences";
import { ITW_TOUR_GROUP_ID } from "../utils/constants";

export const useItwGuidedTour = () => {
  const dispatch = useIODispatch();
  const offlineAccessReason = useIOSelector(offlineAccessReasonSelector);

  const isItwActive = useIOSelector(itwIsL3EnabledSelector);
  const isCompleted = useIOSelector(state =>
    isTourCompletedSelector(state, ITW_TOUR_GROUP_ID)
  );

  /**
   * Starts the tour guide for the ITW on screen focus when:
   * - ITW is active and valid
   * - tour guide was not completed yet
   * - it is not in offline mode (no offline access reason set)
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
