/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/dot-notation */
import { WithTestID } from "@pagopa/io-app-design-system";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React from "react";
import { LayoutRectangle, StyleSheet, View } from "react-native";
import { ParsedCredential, StoredCredential } from "../../utils/itwTypesUtils";
import CardClaim from "./CardClaim";
import { CardSide } from "./types";

type CardDataProps = {
  credential: StoredCredential;
  side: CardSide;
  layout?: LayoutRectangle;
};

const CardData = ({ credential, side }: CardDataProps) =>
  pipe(
    O.fromNullable(dataComponentMap[credential.credentialType]),
    O.map(components => components[side]),
    O.map(DataComponent => (
      <DataComponent
        testID={`credential_data_${credential.credentialType}_${side}_testID`}
        key={`credential_data_${credential.credentialType}_${side}`}
        claims={credential.parsedCredential}
      />
    )),
    O.toNullable
  );

type DataComponentProps = WithTestID<{
  claims: ParsedCredential;
  layout?: LayoutRectangle;
}>;

const MdlFrontData = ({ claims, testID }: DataComponentProps) => (
  <View testID={testID} style={styles.container}>
    <CardClaim claim={claims["portrait"]} position={{ y: 70, x: 16 }} />
    <CardClaim claim={claims["given_name"]} position={{ y: 34, x: 133 }} />
    <CardClaim claim={claims["family_name"]} position={{ y: 53, x: 133 }} />
    <CardClaim claim={claims["birth_date"]} position={{ y: 72, x: 133 }} />
    <CardClaim claim={claims["place_of_birth"]} position={{ y: 72, x: 228 }} />
    <CardClaim claim={claims["issue_date"]} position={{ y: 91, x: 133 }} />
    <CardClaim claim={claims["expiry_date"]} position={{ y: 109, x: 133 }} />
    <CardClaim
      claim={claims["document_number"]}
      position={{ y: 127, x: 133 }}
    />
    <CardClaim
      claim={claims["driving_privileges_details"]}
      position={{ y: 190, x: 35 }}
    />
  </View>
);

const dataComponentMap: Record<
  string,
  Record<CardSide, React.ElementType<DataComponentProps>>
> = {
  MDL: { front: MdlFrontData, back: MdlFrontData }
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
    height: "100%"
  }
});

export default React.memo(CardData);
