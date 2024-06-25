import React, { useCallback, useEffect } from "react";
import { Text, View } from "react-native";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { shouldPresentPreconditionsBottomSheetSelector } from "../../store/reducers/messagePrecondition";

export const Preconditions = () => {
  const dispatch = useIODispatch();
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
      // TODO next action dispatch(toNextMessagePreconditionStatus(to));
    }
  }, [dispatch, modal, shouldPresentBottomSheet]);
  return modal.bottomSheet;
};

const PreconditionsBottomSheetTitle = () => {
  return (
    <View>
      <Text>The text</Text>
    </View>
  );
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
