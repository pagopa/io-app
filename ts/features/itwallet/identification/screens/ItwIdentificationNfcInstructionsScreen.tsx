import {
  ContentWrapper,
  Divider,
  ListItemHeader,
  ListItemInfo
} from "@pagopa/io-app-design-system";
import React from "react";
import { Linking } from "react-native";
import { RNavScreenWithLargeHeader } from "../../../../components/ui/RNavScreenWithLargeHeader";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { FooterStackButton } from "../../common/components/FooterStackButton";

export const ItwIdentificationNfcInstructionsScreen = () => {
  const navigation = useIONavigation();

  const handleOpenSettingsPress = async () => {
    await Linking.openSettings();
  };

  const handleClosePress = () => {
    navigation.pop();
  };

  return (
    <RNavScreenWithLargeHeader
      title={{ label: I18n.t("features.itWallet.identification.nfc.title") }}
      description={I18n.t("features.itWallet.identification.nfc.description")}
      fixedBottomSlot={
        <FooterStackButton
          primaryActionProps={{
            label: I18n.t("features.itWallet.identification.nfc.primaryAction"),
            onPress: handleOpenSettingsPress
          }}
          secondaryActionProps={{
            label: I18n.t(
              "features.itWallet.identification.nfc.secondaryAction"
            ),
            onPress: handleClosePress
          }}
        />
      }
    >
      <ContentWrapper>
        <ListItemHeader
          label={I18n.t("features.itWallet.identification.nfc.header")}
        />
        <ListItemInfo
          label={"Step 1"}
          value={I18n.t("features.itWallet.identification.nfc.steps.1")}
          icon="systemSettingsAndroid"
        />
        <Divider />
        <ListItemInfo
          label={`Step 2`}
          value={I18n.t("features.itWallet.identification.nfc.steps.2")}
          icon="systemAppsAndroid"
        />
        <Divider />
        <ListItemInfo
          label={"Step 3"}
          value={I18n.t("features.itWallet.identification.nfc.steps.3")}
          icon="systemToggleInstructions"
        />
      </ContentWrapper>
    </RNavScreenWithLargeHeader>
  );
};
