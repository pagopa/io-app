import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { IconButton, H6 } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { ClaimDisplayFormat } from "../utils/itwClaimsUtils";
import { ItwCredentialClaim } from "./ItwCredentialClaim";

type Props = {
  title: string;
  claims: ReadonlyArray<ClaimDisplayFormat>;
  canHideValues?: boolean;
};

export const ItwCredentialClaimsSection = ({
  title,
  canHideValues,
  claims
}: Props) => {
  const [valuesHidden, setValuesHidden] = useState(false);

  const renderHideValuesToggle = () => (
    <IconButton
      icon={valuesHidden ? "eyeHide" : "eyeShow"}
      onPress={() => setValuesHidden(x => !x)}
      accessibilityLabel={I18n.t(
        "features.itWallet.presentation.credentialDetails.actions.toggleClaimsVisibility"
      )}
    />
  );

  return (
    <View>
      <View style={styles.header}>
        <H6 color="grey-700">{title}</H6>
        {canHideValues && renderHideValuesToggle()}
      </View>
      <View>
        {claims.map(c => (
          <ItwCredentialClaim key={c.id} claim={c} hidden={valuesHidden} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    justifyContent: "space-between",
    flexDirection: "row"
  }
});
