import {
  ContentWrapper,
  Divider,
  LabelLink,
  ListItemHeader,
  ListItemInfo,
  VSpacer
} from "@pagopa/io-app-design-system";
import React from "react";
import { Alert } from "react-native";
import { RNavScreenWithLargeHeader } from "../../../../components/ui/RNavScreenWithLargeHeader";
import { FooterStackButton } from "../../common/components/FooterStackButton";

export const ItwAuthNfcInstructionsScreen = () => {
  const handleOpenSettingsPress = () => {
    Alert.alert("Not implemented");
  };

  const handleClosePress = () => {
    Alert.alert("Not implemented");
  };

  return (
    <RNavScreenWithLargeHeader
      title={{ label: "Attiva l’NFC per continuare" }}
      description="La funzionalità NFC permette al dispositivo di leggere la tua CIE."
      fixedBottomSlot={
        <FooterStackButton
          primaryActionProps={{
            label: "Vai alle Impostazioni",
            onPress: handleOpenSettingsPress
          }}
          secondaryActionProps={{
            label: "Ho fatto",
            onPress: handleClosePress
          }}
        />
      }
    >
      <ContentWrapper>
        <LabelLink>Scopri di più</LabelLink>
        <VSpacer size={16} />
        <ListItemHeader label="Ecco come attivarlo:" />
        <ListItemInfo
          label={"1. Vai alle Impostazioni"}
          value={"1. Vai alle Impostazioni"}
          icon="systemSettingsAndroid"
        />
        <Divider />
        <ListItemInfo
          label={`2. Cerca "NFC"`}
          value={`2. Cerca "NFC"`}
          icon="systemAppsAndroid"
        />
        <Divider />
        <ListItemInfo
          label={"3. Attivalo"}
          value={"3. Attivalo"}
          icon="systemToggleInstructions"
        />
      </ContentWrapper>
    </RNavScreenWithLargeHeader>
  );
};
