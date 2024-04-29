import {
  ContentWrapper,
  ListItemHeader,
  ModuleCredential,
  VSpacer
} from "@pagopa/io-app-design-system";
import React from "react";
import { Alert } from "react-native";
import { RNavScreenWithLargeHeader } from "../../../../components/ui/RNavScreenWithLargeHeader";

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
      title={{ label: "Con quale metodo vuoi identificarti?" }}
    >
      <ContentWrapper>
        <ListItemHeader label="Metodi disponibili" />
        <ModuleCredential
          label="SPID"
          // description="Usa credenziali e app (o SMS)"
          icon="spid"
          onPress={handleSpidPress}
        />
        <VSpacer size={8} />
        <ModuleCredential
          label="CIE + PIN"
          // description="Usa Carta d’Identità Elettronica e PIN"
          icon="fiscalCodeIndividual"
          onPress={handleCiePinPress}
        />
        <VSpacer size={8} />
        <ModuleCredential
          label="CieID"
          // description="Usa credenziali e app CieID"
          icon="device"
          onPress={handleCieIdPress}
        />
      </ContentWrapper>
    </RNavScreenWithLargeHeader>
  );
};
