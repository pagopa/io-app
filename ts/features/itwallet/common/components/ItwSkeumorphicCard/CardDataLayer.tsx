/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/dot-notation */
import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { StoredCredential } from "../../utils/itwTypesUtils";
import CardClaim from "./CardClaim";
import { CardSide } from "./types";

type CardDataLayerProps = {
  credential: StoredCredential;
  side: CardSide;
};

const CardDataLayer = ({ credential, side }: CardDataLayerProps) => {
  const { parsedCredential: claims, credentialType } = credential;

  return (
    <View style={styles.container}>
      <CardClaim claim={claims["portrait"]} position={{ top: 70, left: 16 }} />
      <CardClaim
        claim={claims["given_name"]}
        position={{ top: 34, left: 133 }}
      />
      <CardClaim
        claim={claims["family_name"]}
        position={{ top: 53, left: 133 }}
      />
      <CardClaim
        claim={claims["birth_date"]}
        position={{ top: 72, left: 133 }}
      />
      <CardClaim
        claim={claims["place_of_birth"]}
        position={{ top: 72, left: 228 }}
      />
      <CardClaim
        claim={claims["issue_date"]}
        position={{ top: 91, left: 133 }}
      />
      <CardClaim
        claim={claims["expiry_date"]}
        position={{ top: 109, left: 133 }}
      />
      <CardClaim
        claim={claims["document_number"]}
        position={{ top: 127, left: 133 }}
      />
      <CardClaim
        claim={claims["driving_privileges_details"]}
        position={{ top: 190, left: 35 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute"
  }
});

export default React.memo(CardDataLayer);
