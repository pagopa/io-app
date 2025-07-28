import { useCallback, useEffect } from "react";
import { HeaderSecondLevel } from "@pagopa/io-app-design-system";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { openWebUrl } from "../../../../utils/url";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import PN_ROUTES from "../../navigation/routes";
import { useIOStore } from "../../../../store/hooks";
import { isPnServiceEnabled } from "../../reminderBanner/reducer/bannerDismiss";
import { areNotificationPermissionsEnabledSelector } from "../../../pushNotifications/store/reducers/environment";
import {
  trackSendQRCodeScanRedirect,
  trackSendQRCodeScanRedirectConfirmed,
  trackSendQRCodeScanRedirectDismissed
} from "../analytics";

export type SendQRScanRedirectComponentProps = {
  aarUrl: string;
};
export const SendQRScanRedirectComponent = ({
  aarUrl
}: SendQRScanRedirectComponentProps) => {
  const store = useIOStore();
  const navigation = useIONavigation();

  const handleOpenSendScreen = useCallback(() => {
    // Analytics
    trackSendQRCodeScanRedirectConfirmed();
    // Open external browser (this is an async process)
    openWebUrl(aarUrl);

    const state = store.getState();

    // If SEND service is disabled, navigate to
    // the service engagement (activation) screen
    const isSendServiceEnabled = isPnServiceEnabled(state) ?? false;
    if (!isSendServiceEnabled) {
      navigation.replace(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
        screen: PN_ROUTES.MAIN,
        params: {
          screen: PN_ROUTES.ENGAGEMENT_SCREEN
        }
      });
      return;
    }

    // If the service was active, check if notifications
    // permissions are enabled. If not, navigate to the
    // notification permission screen
    const areNotificationPermissionsEnabled =
      areNotificationPermissionsEnabledSelector(state);
    if (!areNotificationPermissionsEnabled) {
      navigation.replace(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
        screen: PN_ROUTES.MAIN,
        params: {
          screen: PN_ROUTES.QR_SCAN_PUSH_ENGAGEMENT
        }
      });
      return;
    }

    // Otherwise, both SEND service and notification permissions
    // are already enabled, so just remove the screen
    navigation.popToTop();
  }, [aarUrl, navigation, store]);

  const handleCloseScreen = useCallback(() => {
    trackSendQRCodeScanRedirectDismissed();
    navigation.popToTop();
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderSecondLevel
          title=""
          type="singleAction"
          firstAction={{
            icon: "closeMedium",
            onPress: handleCloseScreen,
            accessibilityLabel: I18n.t("global.buttons.close"),
            testID: "header-close"
          }}
        />
      )
    });
    trackSendQRCodeScanRedirect();
  }, [handleCloseScreen, navigation]);

  return (
    <OperationResultScreenContent
      isHeaderVisible
      pictogram="sendAccess"
      title={I18n.t("features.pn.qrCodeScan.success.openSendScreen.title")}
      action={{
        label: I18n.t("features.pn.qrCodeScan.success.openSendScreen.firstCta"),
        onPress: handleOpenSendScreen,
        testID: "primary-action"
      }}
    />
  );
};
