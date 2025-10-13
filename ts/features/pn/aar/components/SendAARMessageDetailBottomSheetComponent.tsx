import I18n from "i18next";
import { RefObject, useCallback } from "react";
import { useHardwareBackButton } from "../../../../hooks/useHardwareBackButton";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { SendAARMessageDetailBottomSheet } from "./SendAARMessageDetailBottomSheet";

type SendAARMessageDetailBottomSheetComponentProps = {
  aarBottomSheetRef: RefObject<(() => void) | undefined>;
};

export const SendAARMessageDetailBottomSheetComponent = ({
  aarBottomSheetRef
}: SendAARMessageDetailBottomSheetComponentProps) => {
  const { popToTop } = useIONavigation();

  const { bottomSheet, present, dismiss } = useIOBottomSheetModal({
    title: I18n.t("features.pn.aar.flow.closeNotification.title"),
    component: (
      <SendAARMessageDetailBottomSheet
        onPrimaryActionPress={() => dismiss()}
        onSecondaryActionPress={() => {
          dismiss();
          popToTop();
        }}
      />
    )
  });

  const androidBackButtonCallback = useCallback(() => {
    present();
    return false;
  }, [present]);
  useHardwareBackButton(androidBackButtonCallback);

  // eslint-disable-next-line functional/immutable-data
  aarBottomSheetRef.current = present;
  return bottomSheet;
};
