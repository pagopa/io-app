import { useCallback, useMemo } from "react";
import { Alert } from "react-native";
import i18n from "i18next";
import { ListItemInfo } from "@pagopa/io-app-design-system";
import { IOScrollViewWithListItems } from "../../../../components/ui/IOScrollViewWithListItems";
import { useIsNfcFeatureEnabled } from "../hooks/useIsNfcFeatureEnabled";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { currentAARFlowData } from "../store/selectors";
import { sendAARFlowStates } from "../utils/stateUtils";
import { setAarFlowState } from "../store/actions";

export const SendAarActivateNfcComponent = () => {
  const dispatch = useIODispatch();
  const currentAarData = useIOSelector(currentAARFlowData);
  const { isNfcEnabled, openNFCSettings } = useIsNfcFeatureEnabled();

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
      renderItems={listItems}
    />
  );
};
