import { HeaderSecondLevel } from "@pagopa/io-app-design-system";
import i18n from "i18next";
import { useCallback, useEffect, useLayoutEffect } from "react";
import { Alert } from "react-native";
import { useHardwareBackButtonWhenFocused } from "../../../../hooks/useHardwareBackButton";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { PnParamsList } from "../../navigation/params";
import PN_ROUTES from "../../navigation/routes";
import {
  trackSendAarMandateCieReadingClosureAlert,
  trackSendAarMandateCieReadingClosureAlertAccepted,
  trackSendAarMandateCieReadingClosureAlertContinue
} from "../analytics";
import { SendAarActivateNfcComponent } from "../components/SendAarActivateNfcComponent";
import { useSendAarFlowManager } from "../hooks/useSendAarFlowManager";
import { currentAARFlowData } from "../store/selectors";
import { sendAARFlowStates } from "../utils/stateUtils";

export type SendAarActivateNfcScreenProps = IOStackNavigationRouteProps<
  PnParamsList,
  typeof PN_ROUTES.SEND_AAR_NFC_ACTIVATION
>;

export const SendAarActivateNfcScreen = ({
  navigation
}: SendAarActivateNfcScreenProps) => {
  const currentAarData = useIOSelector(currentAARFlowData);
  const { terminateFlow } = useSendAarFlowManager();

  useEffect(() => {
    if (currentAarData.type === sendAARFlowStates.cieScanning) {
      const { type: _, ...params } = currentAarData;

      navigation.replace(PN_ROUTES.SEND_AAR_CIE_CARD_READING, params);
    }
  }, [currentAarData, navigation]);

  const handleClose = useCallback(() => {
    trackSendAarMandateCieReadingClosureAlert("NFC_ACTIVATION");
    Alert.alert(
      i18n.t("features.pn.aar.flow.androidNfcActivation.alertOnClose.title"),
      i18n.t("features.pn.aar.flow.androidNfcActivation.alertOnClose.message"),
      [
        {
          text: i18n.t(
            "features.pn.aar.flow.androidNfcActivation.alertOnClose.confirm"
          ),
          style: "destructive",
          onPress: () => {
            trackSendAarMandateCieReadingClosureAlertAccepted("NFC_ACTIVATION");
            terminateFlow();
          }
        },
        {
          text: i18n.t(
            "features.pn.aar.flow.androidNfcActivation.alertOnClose.cancel"
          ),
          onPress: () => {
            trackSendAarMandateCieReadingClosureAlertContinue("NFC_ACTIVATION");
          }
        }
      ]
    );
  }, [terminateFlow]);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderSecondLevel
          title=""
          ignoreSafeAreaMargin={false}
          type="singleAction"
          firstAction={{
            icon: "closeLarge",
            onPress: handleClose,
            accessibilityLabel: i18n.t("global.buttons.close"),
            testID: "closeActionID"
          }}
        />
      )
    });
  }, [navigation, handleClose]);

  useHardwareBackButtonWhenFocused(() => {
    handleClose();
    return true;
  });

  return <SendAarActivateNfcComponent />;
};
