import I18n from "i18next";
import { forwardRef, useCallback, useImperativeHandle } from "react";
import { useHardwareBackButton } from "../../../../hooks/useHardwareBackButton";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { SendAARMessageDetailBottomSheet } from "./SendAARMessageDetailBottomSheet";

export type SendAARMessageDetailBottomSheetComponentRef = {
  present: () => void;
};

export const SendAARMessageDetailBottomSheetComponent =
  forwardRef<SendAARMessageDetailBottomSheetComponentRef>((_, ref) => {
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

    useImperativeHandle(ref, () => ({
      present
    }));

    return bottomSheet;
  });
