import {
  ContentWrapper,
  ListItemHeader,
  ModuleCredential,
  VSpacer
} from "@pagopa/io-app-design-system";
import React from "react";
import { Alert } from "react-native";
import { RNavScreenWithLargeHeader } from "../../../../components/ui/RNavScreenWithLargeHeader";
import I18n from "../../../../i18n";

export const ItwAuthModeSelectionScreen = () => {
  const handleSpidPress = () => {
    Alert.alert("Not implemented");
  };

  const handleCiePinPress = () => {
    Alert.alert("Not implemented");
  };

  const handleCieIdPress = () => {
    Alert.alert("Not implemented");
  };

  return (
    <RNavScreenWithLargeHeader
      title={{ label: I18n.t("features.itWallet.authentication.title") }}
    >
      <ContentWrapper>
        <ListItemHeader
          label={I18n.t("features.itWallet.authentication.header")}
        />
        <ModuleCredential
          label={I18n.t("features.itWallet.authentication.method.spid.title")}
          // description="Usa credenziali e app (o SMS)"
          icon="spid"
          onPress={handleSpidPress}
        />
        <VSpacer size={8} />
        <ModuleCredential
          label={I18n.t("features.itWallet.authentication.method.ciePin.title")}
          // description="Usa Carta d’Identità Elettronica e PIN"
          icon="fiscalCodeIndividual"
          onPress={handleCiePinPress}
        />
        <VSpacer size={8} />
        <ModuleCredential
          label={I18n.t("features.itWallet.authentication.method.cieId.title")}
          // description="Usa credenziali e app CieID"
          icon="device"
          onPress={handleCieIdPress}
        />
      </ContentWrapper>
    </RNavScreenWithLargeHeader>
  );
};
