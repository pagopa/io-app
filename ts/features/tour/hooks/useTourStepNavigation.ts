import { useCallback } from "react";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { completeTourAction, nextTourStepAction } from "../store/actions";
import {
  activeGroupIdSelector,
  activeStepIndexSelector,
  tourItemsForActiveGroupSelector
} from "../store/selectors";

export const useTourStepNavigation = () => {
  const dispatch = useIODispatch();
  const groupId = useIOSelector(activeGroupIdSelector);
  const stepIndex = useIOSelector(activeStepIndexSelector);
  const items = useIOSelector(tourItemsForActiveGroupSelector);

  const handleNext = useCallback(() => {
    if (!groupId) {
      return;
    }
    if (stepIndex >= items.length - 1) {
      dispatch(completeTourAction({ groupId }));
    } else {
      dispatch(nextTourStepAction());
    }
  }, [dispatch, groupId, stepIndex, items.length]);

  return { handleNext };
};
