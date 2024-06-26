import React, { useCallback, useEffect } from "react";
import { Text, View } from "react-native";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../store/hooks";
import {
  preconditionsRequireAppUpdateSelector,
  shouldPresentPreconditionsBottomSheetSelector
} from "../../store/reducers/messagePrecondition";
import {
  retrievingDataPreconditionStatusAction,
  toRetrievingDataPayload,
  toUpdateRequiredPayload,
  updateRequiredPreconditionStatusAction
} from "../../store/actions/preconditions";
import { PreconditionsTitle } from "./PreconditionsTitle";

export const Preconditions = () => {
  const dispatch = useIODispatch();
  const store = useIOStore();
  const onDismissCallback = useCallback(() => undefined, []);
  const modal = useIOBottomSheetModal({
    snapPoint: [500],
    title: <PreconditionsTitle />,
    component: <PreconditionsBottomSheetContent />,
    footer: <PreconditionsBottomSheetFooter />,
    onDismiss: onDismissCallback
  });
  const shouldPresentBottomSheet = useIOSelector(
    shouldPresentPreconditionsBottomSheetSelector
  );

  useEffect(() => {
    if (shouldPresentBottomSheet) {
      modal.present();
      const state = store.getState();
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

const PreconditionsBottomSheetContent = () => (
  <View>
    <Text>The text</Text>
  </View>
);

const PreconditionsBottomSheetFooter = () => (
  <View>
    <Text>The texta</Text>
  </View>
);
