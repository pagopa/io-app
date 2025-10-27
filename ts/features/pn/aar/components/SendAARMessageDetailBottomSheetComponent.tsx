import I18n from "i18next";
import { RefObject } from "react";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOStore } from "../../../../store/hooks";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import PN_ROUTES from "../../navigation/routes";
import { isPnServiceEnabled } from "../../reminderBanner/reducer/bannerDismiss";
import { SendUserType } from "../../../pushNotifications/analytics";
import { trackSendAarNotificationClosureBack } from "../analytics";
import { SendAARMessageDetailBottomSheet } from "./SendAARMessageDetailBottomSheet";

export type SendAARMessageDetailBottomSheetComponentProps = {
  aarBottomSheetRef: RefObject<(() => void) | undefined>;
  isDelegate: boolean;
};

export const SendAARMessageDetailBottomSheetComponent = ({
  aarBottomSheetRef,
  isDelegate
}: SendAARMessageDetailBottomSheetComponentProps) => {
  const navigation = useIONavigation();
  const store = useIOStore();

  const onSecondaryActionPress = () => {
    dismiss();
    const state = store.getState();
    // This selector returns undefined if service's preferences have
    // not been requested and loaded yet. But here, we are looking at
    // the SEND special service's preferences, which were requested
    // upon application startup. So, we make the assumption that
    // either they were properly retrieved (and the selector will not
    // return undefined) or, if there was an error of some sort, we
    // do not make the request again and do not wait for them to be
    // retrieved. The undefined case is treated as a disabled service,
    // showing the activation flow to the user.
    const isSendServiceEnabled = isPnServiceEnabled(state) ?? false;

    if (isSendServiceEnabled) {
      navigation.popToTop();
      return;
    }

    navigation.replace(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
      screen: PN_ROUTES.MAIN,
      params: {
        screen: PN_ROUTES.ENGAGEMENT_SCREEN,
        params: {
          sendOpeningSource: "aar",
          sendUserType: isDelegate ? "mandatory" : "recipient"
        }
      }
    });
  };

  const { bottomSheet, present, dismiss } = useIOBottomSheetModal({
    title: I18n.t("features.pn.aar.flow.closeNotification.title"),
    component: (
      <SendAARMessageDetailBottomSheet
        onPrimaryActionPress={() => {
          const userType: SendUserType = isDelegate ? "mandatory" : "recipient";
          trackSendAarNotificationClosureBack(userType);
          dismiss();
        }}
        onSecondaryActionPress={onSecondaryActionPress}
      />
    )
  });

  // eslint-disable-next-line functional/immutable-data
  aarBottomSheetRef.current = present;
  return bottomSheet;
};
