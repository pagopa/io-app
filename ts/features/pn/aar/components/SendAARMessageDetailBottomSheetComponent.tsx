import I18n from "i18next";
import { RefObject, useCallback } from "react";
import { useHardwareBackButton } from "../../../../hooks/useHardwareBackButton";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOStore } from "../../../../store/hooks";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import PN_ROUTES from "../../navigation/routes";
import { isPnServiceEnabled } from "../../reminderBanner/reducer/bannerDismiss";
import { SendAARMessageDetailBottomSheet } from "./SendAARMessageDetailBottomSheet";

type SendAARMessageDetailBottomSheetComponentProps = {
  aarBottomSheetRef: RefObject<(() => void) | undefined>;
};

export const SendAARMessageDetailBottomSheetComponent = ({
  aarBottomSheetRef
}: SendAARMessageDetailBottomSheetComponentProps) => {
  const navigation = useIONavigation();
  const store = useIOStore();

  const onSecondaryActionPress = () => {
    dismiss();
    const state = store.getState();
    const isSendServiceEnabled = isPnServiceEnabled(state) ?? false;
    if (!isSendServiceEnabled) {
      navigation.replace(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
        screen: PN_ROUTES.MAIN,
        params: {
          screen: PN_ROUTES.ENGAGEMENT_SCREEN
        }
      });
    } else {
      navigation.popToTop();
    }
  };

  const { bottomSheet, present, dismiss } = useIOBottomSheetModal({
    title: I18n.t("features.pn.aar.flow.closeNotification.title"),
    component: (
      <SendAARMessageDetailBottomSheet
        onPrimaryActionPress={() => dismiss()}
        onSecondaryActionPress={onSecondaryActionPress}
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
