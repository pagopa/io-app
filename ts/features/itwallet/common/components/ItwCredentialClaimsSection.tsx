import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { IconButton, H6, Divider } from "@pagopa/io-app-design-system";
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
      testID="toggle-claim-visibility"
      icon={valuesHidden ? "eyeHide" : "eyeShow"}
      onPress={() => setValuesHidden(x => !x)}
      accessibilityLabel={I18n.t(
        valuesHidden
          ? "features.itWallet.presentation.credentialDetails.actions.showClaimValues"
          : "features.itWallet.presentation.credentialDetails.actions.hideClaimValues"
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
        {claims.map((claim, index) => (
          <React.Fragment key={claim.id}>
            {index !== 0 && <Divider />}
            <ItwCredentialClaim claim={claim} hidden={valuesHidden} />
          </React.Fragment>
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
