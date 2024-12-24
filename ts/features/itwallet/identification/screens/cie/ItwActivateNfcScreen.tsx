import {
  ContentWrapper,
  Divider,
  ListItemHeader,
  ListItemInfo
} from "@pagopa/io-app-design-system";
import { useCallback } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { IOScrollViewWithLargeHeader } from "../../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../../i18n";
import * as cieUtils from "../../../../../utils/cie";
import { ItwEidIssuanceMachineContext } from "../../../machine/provider";
import {
  trackItWalletCieNfcActivation,
  trackItWalletCieNfcGoToSettings
} from "../../../analytics";

export const ItwActivateNfcScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  useFocusEffect(trackItWalletCieNfcActivation);

  const openSettings = useCallback(async () => {
    trackItWalletCieNfcGoToSettings();
    await cieUtils.openNFCSettings();
  }, []);

  const onContinue = useCallback(async () => {
    const isNfcEnabled = await cieUtils.isNfcEnabled();

    if (isNfcEnabled) {
      machineRef.send({ type: "nfc-enabled" });
    } else {
      Alert.alert(I18n.t("authentication.cie.nfc.activeNfcAlert"), "", [
        {
          text: I18n.t("global.buttons.cancel"),
          style: "cancel"
        },
        {
          text: I18n.t("authentication.cie.nfc.activeNFCAlertButton"),
          onPress: openSettings
        }
      ]);
    }
  }, [openSettings, machineRef]);

  return (
    <IOScrollViewWithLargeHeader
      title={{ label: I18n.t("features.itWallet.identification.nfc.title") }}
      description={I18n.t("features.itWallet.identification.nfc.description")}
      actions={{
        type: "TwoButtons",
        primary: {
          label: I18n.t("features.itWallet.identification.nfc.primaryAction"),
          onPress: openSettings
        },
        secondary: {
          label: I18n.t("features.itWallet.identification.nfc.secondaryAction"),
          onPress: onContinue
        }
      }}
    >
      <ContentWrapper>
        <ListItemHeader
          label={I18n.t("features.itWallet.identification.nfc.header")}
        />
        <ListItemInfo
          label={I18n.t("features.itWallet.identification.nfc.steps.label", {
            value: 1
          })}
          value={I18n.t("features.itWallet.identification.nfc.steps.1")}
          icon="systemSettingsAndroid"
        />
        <Divider />
        <ListItemInfo
          label={I18n.t("features.itWallet.identification.nfc.steps.label", {
            value: 2
          })}
          value={I18n.t("features.itWallet.identification.nfc.steps.2")}
          icon="systemAppsAndroid"
        />
        <Divider />
        <ListItemInfo
          label={I18n.t("features.itWallet.identification.nfc.steps.label", {
            value: 3
          })}
          value={I18n.t("features.itWallet.identification.nfc.steps.3")}
          icon="systemToggleInstructions"
        />
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};
