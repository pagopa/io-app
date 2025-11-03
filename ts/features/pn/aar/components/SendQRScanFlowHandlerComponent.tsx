import { HeaderSecondLevel } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useCallback, useEffect } from "react";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector, useIOStore } from "../../../../store/hooks";
import { openWebUrl } from "../../../../utils/url";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import { areNotificationPermissionsEnabledSelector } from "../../../pushNotifications/store/reducers/environment";
import PN_ROUTES from "../../navigation/routes";
import { isPnServiceEnabled } from "../../reminderBanner/reducer/bannerDismiss";
import {
  trackSendQRCodeScanRedirect,
  trackSendQRCodeScanRedirectConfirmed,
  trackSendQRCodeScanRedirectDismissed
} from "../analytics";
import { SendAARInitialFlowScreen } from "../screen/SendAARInitialFlowScreen";
import { NOTIFICATIONS_ROUTES } from "../../../pushNotifications/navigation/routes";
import { isAarRemoteEnabled } from "../../../../store/reducers/backendStatus/remoteConfig";

export type SendQRScanHandlerScreenProps = {
  aarUrl: string;
};

export const SendQRScanFlowHandlerComponent = ({
  aarUrl
}: SendQRScanHandlerScreenProps) => {
  const aAREnabled = useIOSelector(isAarRemoteEnabled);

  return aAREnabled ? (
    <SendAARInitialFlowScreen qrCode={aarUrl} />
  ) : (
    <SendQrScanRedirect aarUrl={aarUrl} />
  );
};

const SendQrScanRedirect = ({ aarUrl }: SendQRScanHandlerScreenProps) => {
  const store = useIOStore();
  const navigation = useIONavigation();

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
          screen: PN_ROUTES.ENGAGEMENT_SCREEN,
          params: {
            sendOpeningSource: "aar",
            sendUserType: "not_set"
          }
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
      navigation.replace(NOTIFICATIONS_ROUTES.PUSH_NOTIFICATION_ENGAGEMENT, {
        flow: "send_notification_opening",
        sendOpeningSource: "aar",
        sendUserType: "not_set"
      });
      return;
    }

    // Otherwise, both SEND service and notification permissions
    // are already enabled, so just remove the screen
    navigation.popToTop();
  }, [aarUrl, navigation, store]);

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
