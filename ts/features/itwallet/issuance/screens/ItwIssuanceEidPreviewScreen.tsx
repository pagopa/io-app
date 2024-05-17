import { IOColors, VSpacer } from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet, View } from "react-native";
import { RNavScreenWithLargeHeader } from "../../../../components/ui/RNavScreenWithLargeHeader";
import { ItwCredentialsMocks } from "../../__mocks__/credentials";
import { EidCardPreview } from "../../common/components/EidCardPreview";
import { ItwCredentialClaimsList } from "../../common/components/ItwCredentialClaimList";

export const ItwIssuanceEidPreviewScreen = () => {
  // Mock data
  const eid = ItwCredentialsMocks.eid;

  return (
    <RNavScreenWithLargeHeader
      title={{ label: "{Identità Digitale}: ecco l’anteprima" }}
    >
      <View style={styles.preview}>
        <EidCardPreview />
      </View>
      <View style={styles.dropShadow}>
        <VSpacer size={24} />
      </View>
      <View style={styles.content}>
        <ItwCredentialClaimsList data={eid} />
      </View>
    </RNavScreenWithLargeHeader>
  );
};

const styles = StyleSheet.create({
  preview: {
    paddingHorizontal: 24
  },
  dropShadow: {
    backgroundColor: IOColors.white,
    shadowColor: IOColors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 20,
    shadowOpacity: 0.15,
    elevation: 5
  },
  content: {
    flex: 1,
    backgroundColor: IOColors.white, // Add background to cover shadow
    paddingHorizontal: 24
  }
});
