import { ListItemInfo } from "@io-app/design-system";
import I18n from "i18next";
import { useCallback, useMemo } from "react";
import { Alert } from "react-native";

import { IOScrollViewWithListItems } from "../../../../components/ui/IOScrollViewWithListItems";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  trackSendAarMandateCieNfcActivationContinue,
  trackSendAarMandateCieNfcActivationControlAlert,
  trackSendAarMandateCieNfcActivationControlAlertClosure,
  trackSendAarMandateCieNfcActivationControlAlertGoToSettings,
  trackSendAarMandateCieNfcGoToSettings
} from "../analytics";
import { useIsNfcFeatureEnabled } from "../hooks/useIsNfcFeatureEnabled";
import { setAarFlowState } from "../store/actions";
import { currentAarFlowData } from "../store/selectors";
import { sendAarFlowStates } from "../utils/stateUtils";

export const SendAarActivateNfcComponent = () => {
  const dispatch = useIODispatch();
  const currentAarData = useIOSelector(currentAarFlowData);
  const { isNfcEnabled, openNFCSettings } = useIsNfcFeatureEnabled();

  const onContinue = useCallback(async () => {
    trackSendAarMandateCieNfcActivationContinue();
    const isEnabled = await isNfcEnabled();

    if (!isEnabled) {
      trackSendAarMandateCieNfcActivationControlAlert();

      Alert.alert(
        I18n.t(
          "features.pn.aar.flow.androidNfcActivation.alertOnContinue.title"
        ),
        undefined,
        [
          {
            text: I18n.t("global.buttons.close"),
            style: "cancel",
            onPress: trackSendAarMandateCieNfcActivationControlAlertClosure
          },
          {
            text: I18n.t(
              "features.pn.aar.flow.androidNfcActivation.alertOnContinue.confirm"
            ),
            onPress: () => {
              trackSendAarMandateCieNfcActivationControlAlertGoToSettings();
              openNFCSettings();
            }
          }
        ]
      );
      return;
    }

    if (currentAarData.type === sendAarFlowStates.androidNFCActivation) {
      dispatch(
        setAarFlowState({
          ...currentAarData,
          type: sendAarFlowStates.cieScanning
        })
      );
    }
  }, [currentAarData, openNFCSettings, isNfcEnabled, dispatch]);

  const listItems = useMemo<Array<ListItemInfo>>(
    () => [
      {
        label: I18n.t(
          "features.pn.aar.flow.androidNfcActivation.content.listItems.step1.label"
        ),
        value: I18n.t(
          "features.pn.aar.flow.androidNfcActivation.content.listItems.step1.value"
        ),
        icon: "systemSettingsAndroid"
      },
      {
        label: I18n.t(
          "features.pn.aar.flow.androidNfcActivation.content.listItems.step2.label"
        ),
        value: I18n.t(
          "features.pn.aar.flow.androidNfcActivation.content.listItems.step2.value"
        ),
        icon: "systemAppsAndroid"
      },
      {
        label: I18n.t(
          "features.pn.aar.flow.androidNfcActivation.content.listItems.step3.label"
        ),
        value: I18n.t(
          "features.pn.aar.flow.androidNfcActivation.content.listItems.step3.value"
        ),
        icon: "systemToggleInstructions"
      }
    ],
    []
  );

  return (
    <IOScrollViewWithListItems
      actions={{
        type: "TwoButtons",
        primary: {
          testID: "primaryActionID",
          label: I18n.t(
            "features.pn.aar.flow.androidNfcActivation.primaryAction"
          ),
          onPress: () => {
            trackSendAarMandateCieNfcGoToSettings();
            openNFCSettings();
          }
        },
        secondary: {
          testID: "secondaryActionID",
          label: I18n.t(
            "features.pn.aar.flow.androidNfcActivation.secondaryAction"
          ),
          onPress: () => void onContinue()
        }
      }}
      listItemHeaderLabel={I18n.t(
        "features.pn.aar.flow.androidNfcActivation.content.listItemsHeader"
      )}
      renderItems={listItems}
      subtitle={I18n.t("features.pn.aar.flow.androidNfcActivation.description")}
      title={I18n.t("features.pn.aar.flow.androidNfcActivation.title")}
    />
  );
};
