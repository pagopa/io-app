import { HeaderSecondLevel } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useCallback, useEffect } from "react";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../store/hooks";
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
import { setAarFlowState } from "../store/actions";
import { currentAARFlowData, sendAARFlowStates } from "../store/reducers";
import {
  SendAARTosComponent,
  SendAARTosComponentProps
} from "./SendAARTosComponent";
import { SendAARLoadingComponent } from "./SendAARLoadingComponent";

export type SendQRScanFlowHandlerComponentProps = {
  aarUrl: string;
};

export const SendQRScanFlowHandlerComponent = ({
  aarUrl,
  /**
   * this is purely a temporary addition in order
   * to differentiate between phase 1 and 2 of the AAR flow.
   * will be removed once we update to phase 2
   * */
  isAarPhase2 = false
}: SendQRScanFlowHandlerComponentProps & { isAarPhase2?: boolean }) =>
  isAarPhase2 ? (
    <SendAARInitialFlowScreen qrCode={aarUrl} />
  ) : (
    <SendQrScanRedirect aarUrl={aarUrl} />
  );

const SendAARInitialFlowScreen = ({ qrCode }: SendAARTosComponentProps) => {
  const flowData = useIOSelector(currentAARFlowData);
  const flowState = flowData.type;
  const dispatch = useIODispatch();

  useEffect(() => {
    if (flowState === sendAARFlowStates.none) {
      dispatch(
        setAarFlowState({
          type: sendAARFlowStates.displayingAARToS,
          qrCode
        })
      );
    }
  }, [dispatch, qrCode, flowState]);

  switch (flowState) {
    case sendAARFlowStates.displayingAARToS:
      return <SendAARTosComponent qrCode={flowData.qrCode} />;
    default:
      return <SendAARLoadingComponent />;
  }
};
const SendQrScanRedirect = ({
  aarUrl
}: SendQRScanFlowHandlerComponentProps) => {
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
