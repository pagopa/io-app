import { useEffect, useLayoutEffect } from "react";
import { Alert } from "react-native";
import i18n from "i18next";
import { HeaderSecondLevel } from "@pagopa/io-app-design-system";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { PnParamsList } from "../../navigation/params";
import PN_ROUTES from "../../navigation/routes";
import { useSendAarFlowManager } from "../hooks/useSendAarFlowManager";
import { useIOSelector } from "../../../../store/hooks";
import { currentAARFlowData } from "../store/selectors";
import { sendAARFlowStates } from "../utils/stateUtils";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import { SendAarActivateNfcComponent } from "../components/SendAarActivateNfcComponent";

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

      navigation.replace(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
        screen: PN_ROUTES.MAIN,
        params: {
          screen: PN_ROUTES.SEND_AAR_CIE_CARD_READING,
          params
        }
      });
    }
  }, [currentAarData, navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderSecondLevel
          title=""
          ignoreSafeAreaMargin={false}
          type="singleAction"
          firstAction={{
            icon: "closeLarge",
            onPress: () => {
              Alert.alert(
                i18n.t(
                  "features.pn.aar.flow.androidNfcActivation.alertOnClose.title"
                ),
                i18n.t(
                  "features.pn.aar.flow.androidNfcActivation.alertOnClose.message"
                ),
                [
                  {
                    text: i18n.t(
                      "features.pn.aar.flow.androidNfcActivation.alertOnClose.confirm"
                    ),
                    style: "destructive",
                    onPress: terminateFlow
                  },
                  {
                    text: i18n.t(
                      "features.pn.aar.flow.androidNfcActivation.alertOnClose.cancel"
                    )
                  }
                ]
              );
            },
            accessibilityLabel: i18n.t("global.buttons.close"),
            testID: "header-close"
          }}
        />
      )
    });
  }, [navigation, terminateFlow]);

  return <SendAarActivateNfcComponent />;
};
