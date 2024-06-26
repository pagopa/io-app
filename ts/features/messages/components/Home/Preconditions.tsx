import React, { useCallback, useEffect } from "react";
import { Text, View } from "react-native";
import { constUndefined, pipe } from "fp-ts/lib/function";
import * as B from "fp-ts/lib/boolean";
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
  toNextMessagePreconditionStatus,
  toRetrievingDataPayload,
  toUpdateRequiredPayload
} from "../../store/actions/preconditions";

export const Preconditions = () => {
  const dispatch = useIODispatch();
  const store = useIOStore();
  const onDismissCallback = useCallback(() => undefined, []);
  const modal = useIOBottomSheetModal({
    snapPoint: [500],
    title: <PreconditionsBottomSheetTitle />,
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
      const payload = requiresAppUpdate
        ? toUpdateRequiredPayload()
        : toRetrievingDataPayload();
      dispatch(toNextMessagePreconditionStatus(payload));
    }
  }, [dispatch, modal, shouldPresentBottomSheet, store]);
  return modal.bottomSheet;
};

const PreconditionsBottomSheetContent = () => {
  return (
    <View>
      <Text>The text</Text>
    </View>
  );
};

const PreconditionsBottomSheetFooter = () => {
  return (
    <View>
      <Text>The text</Text>
    </View>
  );
};
