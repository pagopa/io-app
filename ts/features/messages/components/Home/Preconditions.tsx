import React, { useCallback, useEffect } from "react";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../store/hooks";
import {
  preconditionsCategoryTagSelector,
  preconditionsRequireAppUpdateSelector,
  shouldPresentPreconditionsBottomSheetSelector
} from "../../store/reducers/messagePrecondition";
import {
  clearMessagePrecondition,
  idlePreconditionStatusAction,
  retrievingDataPreconditionStatusAction,
  toIdlePayload,
  toRetrievingDataPayload,
  toUpdateRequiredPayload,
  updateRequiredPreconditionStatusAction
} from "../../store/actions/preconditions";
import { trackDisclaimerOpened } from "../../analytics";
import { PreconditionsTitle } from "./PreconditionsTitle";
import { PreconditionsContent } from "./PreconditionsContent";
import { PreconditionsFooter } from "./PreconditionsFooter";

export const Preconditions = () => {
  const dispatch = useIODispatch();
  const store = useIOStore();
  const onDismissCallback = useCallback(() => {
    dispatch(clearMessagePrecondition());
    dispatch(idlePreconditionStatusAction(toIdlePayload()));
  }, [dispatch]);
  const modal = useIOBottomSheetModal({
    snapPoint: [500],
    title: <PreconditionsTitle />,
    component: <PreconditionsContent />,
    footer: <PreconditionsFooter onDismiss={() => modal.dismiss()} />,
    onDismiss: onDismissCallback
  });
  const shouldPresentBottomSheet = useIOSelector(
    shouldPresentPreconditionsBottomSheetSelector
  );

  useEffect(() => {
    if (shouldPresentBottomSheet) {
      const state = store.getState();
      const categoryTag = preconditionsCategoryTagSelector(state);
      if (categoryTag) {
        trackDisclaimerOpened(categoryTag);
      }
      modal.present();

      const requiresAppUpdate = preconditionsRequireAppUpdateSelector(state);
      if (requiresAppUpdate) {
        dispatch(
          updateRequiredPreconditionStatusAction(toUpdateRequiredPayload())
        );
      } else {
        dispatch(
          retrievingDataPreconditionStatusAction(toRetrievingDataPayload())
        );
      }
    }
  }, [dispatch, modal, shouldPresentBottomSheet, store]);
  return modal.bottomSheet;
};
