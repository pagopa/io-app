import { useCallback, useEffect, useLayoutEffect } from "react";
import { Alert } from "react-native";
import i18n from "i18next";
import { HeaderSecondLevel } from "@pagopa/io-app-design-system";
import { IOScrollViewWithListItems } from "../../../../components/ui/IOScrollViewWithListItems";
import { useIsNfcFeatureEnabled } from "../hooks/useIsNfcFeatureEnabled";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { PnParamsList } from "../../navigation/params";
import PN_ROUTES from "../../navigation/routes";
import { useSendAarFlowManager } from "../hooks/useSendAarFlowManager";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { currentAARFlowData } from "../store/selectors";
import { sendAARFlowStates } from "../utils/stateUtils";
import { setAarFlowState } from "../store/actions";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";

export type SendAarActivateNfcScreenProps = IOStackNavigationRouteProps<
  PnParamsList,
  typeof PN_ROUTES.SEND_AAR_NFC_ACTIVATION
>;

export const SendAarActivateNfcScreen = ({
  navigation
}: SendAarActivateNfcScreenProps) => {
  const dispatch = useIODispatch();
  const currentAarData = useIOSelector(currentAARFlowData);
  const { isNfcEnabled, openNFCSettings } = useIsNfcFeatureEnabled();
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

  const onContinue = useCallback(async () => {
    const isEnabled = await isNfcEnabled();

    if (!isEnabled) {
      Alert.alert(
        i18n.t(
          "features.pn.aar.flow.androidNfcActivation.alertOnContinue.title"
        ),
        undefined,
        [
          {
            text: i18n.t("global.buttons.close"),
            style: "cancel"
          },
          {
            text: i18n.t(
              "features.pn.aar.flow.androidNfcActivation.alertOnContinue.confirm"
            ),
            onPress: openNFCSettings
          }
        ]
      );
      return;
    }

    if (currentAarData.type === sendAARFlowStates.androidNFCActivation) {
      dispatch(
        setAarFlowState({
          ...currentAarData,
          type: sendAARFlowStates.cieScanning
        })
      );
    }
  }, [currentAarData, openNFCSettings, isNfcEnabled, dispatch]);

  const handleOnClose = useCallback(() => {
    Alert.alert(
      i18n.t("features.pn.aar.flow.androidNfcActivation.alertOnClose.title"),
      i18n.t("features.pn.aar.flow.androidNfcActivation.alertOnClose.message"),
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
            onPress: handleOnClose,
            accessibilityLabel: i18n.t("global.buttons.close"),
            testID: "header-close"
          }}
        />
      )
    });
  }, [navigation, handleOnClose]);

  return (
    <IOScrollViewWithListItems
      title={i18n.t("features.pn.aar.flow.androidNfcActivation.title")}
      subtitle={i18n.t("features.pn.aar.flow.androidNfcActivation.description")}
      actions={{
        type: "TwoButtons",
        primary: {
          label: i18n.t(
            "features.pn.aar.flow.androidNfcActivation.primaryAction"
          ),
          onPress: openNFCSettings
        },
        secondary: {
          label: i18n.t(
            "features.pn.aar.flow.androidNfcActivation.secondaryAction"
          ),
          onPress: onContinue
        }
      }}
      listItemHeaderLabel={i18n.t(
        "features.pn.aar.flow.androidNfcActivation.content.listItemsHeader"
      )}
      renderItems={[
        {
          label: i18n.t(
            "features.pn.aar.flow.androidNfcActivation.content.listItems.step1.label"
          ),
          value: i18n.t(
            "features.pn.aar.flow.androidNfcActivation.content.listItems.step1.value"
          ),
          icon: "systemSettingsAndroid"
        },
        {
          label: i18n.t(
            "features.pn.aar.flow.androidNfcActivation.content.listItems.step2.label"
          ),
          value: i18n.t(
            "features.pn.aar.flow.androidNfcActivation.content.listItems.step2.value"
          ),
          icon: "systemAppsAndroid"
        },
        {
          label: i18n.t(
            "features.pn.aar.flow.androidNfcActivation.content.listItems.step3.label"
          ),
          value: i18n.t(
            "features.pn.aar.flow.androidNfcActivation.content.listItems.step3.value"
          ),
          icon: "systemToggleInstructions"
        }
      ]}
    />
  );
};
