import { ListItemInfo } from "@pagopa/io-app-design-system";
import i18n from "i18next";
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
import { currentAARFlowData } from "../store/selectors";
import { sendAARFlowStates } from "../utils/stateUtils";

export const SendAarActivateNfcComponent = () => {
  const dispatch = useIODispatch();
  const currentAarData = useIOSelector(currentAARFlowData);
  const { isNfcEnabled, openNFCSettings } = useIsNfcFeatureEnabled();

  const onContinue = useCallback(async () => {
    trackSendAarMandateCieNfcActivationContinue();
    const isEnabled = await isNfcEnabled();

    if (!isEnabled) {
      trackSendAarMandateCieNfcActivationControlAlert();

      Alert.alert(
        i18n.t(
          "features.pn.aar.flow.androidNfcActivation.alertOnContinue.title"
        ),
        undefined,
        [
          {
            text: i18n.t("global.buttons.close"),
            style: "cancel",
            onPress: trackSendAarMandateCieNfcActivationControlAlertClosure
          },
          {
            text: i18n.t(
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

    if (currentAarData.type === sendAARFlowStates.androidNFCActivation) {
      dispatch(
        setAarFlowState({
          ...currentAarData,
          type: sendAARFlowStates.cieScanning
        })
      );
    }
  }, [currentAarData, openNFCSettings, isNfcEnabled, dispatch]);

  const listItems = useMemo<Array<ListItemInfo>>(
    () => [
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
    ],
    []
  );

  return (
    <IOScrollViewWithListItems
      actions={{
        type: "TwoButtons",
        primary: {
          testID: "primaryActionID",
          label: i18n.t(
            "features.pn.aar.flow.androidNfcActivation.primaryAction"
          ),
          onPress: () => {
            trackSendAarMandateCieNfcGoToSettings();
            openNFCSettings();
          }
        },
        secondary: {
          testID: "secondaryActionID",
          label: i18n.t(
            "features.pn.aar.flow.androidNfcActivation.secondaryAction"
          ),
          onPress: onContinue
        }
      }}
      listItemHeaderLabel={i18n.t(
        "features.pn.aar.flow.androidNfcActivation.content.listItemsHeader"
      )}
      renderItems={listItems}
      subtitle={i18n.t("features.pn.aar.flow.androidNfcActivation.description")}
      title={i18n.t("features.pn.aar.flow.androidNfcActivation.title")}
    />
  );
};
