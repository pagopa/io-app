import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { IconButton, H6 } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { ClaimDisplayFormat } from "../utils/itwClaimsUtils";

type Props = {
  title: string;
  claims: Array<ClaimDisplayFormat>;
  canHideValues?: boolean;
};

export const ItwCredentialClaimsSection = ({
  title,
  claims,
  canHideValues
}: Props) => {
  const [valuesHidden, setValuesHidden] = useState(false);

  const renderHideValuesToggle = () => (
    <IconButton
      icon={valuesHidden ? "eyeHide" : "eyeShow"}
      onPress={() => setValuesHidden(x => !x)}
      accessibilityLabel={I18n.t(
        "features.itWallet.presentation.accessibility.toggleClaimValues"
      )}
    />
  );

  return (
    <View>
      <View style={styles.header}>
        <H6 color="grey-700">{title}</H6>
        {canHideValues && renderHideValuesToggle()}
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
