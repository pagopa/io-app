import {
  Body,
  ButtonSolid,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import React from "react";
import { View } from "react-native";

const WalletEmptyScreenContent = () => {
  const handleAddToWalletButtonPress = () => {
    // TODO SIW-923: navigate to available cards/initiatives list
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 24,
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <Pictogram name="cardAdd" />
      <VSpacer size={16} />
      <Body color="grey-650" weight="Regular" style={{ textAlign: "center" }}>
        Custodisci qui i tuoi metodi di pagamento, Carta Giovani Nazionale,
        bonus e sconti.
      </Body>
      <VSpacer size={24} />
      <ButtonSolid
        label="Aggiungi al Portafoglio"
        accessibilityLabel="Aggiungi al Portafoglio"
        onPress={handleAddToWalletButtonPress}
        icon="add"
        iconPosition="end"
        fullWidth={true}
      />
    </View>
  );
};

export { WalletEmptyScreenContent };
