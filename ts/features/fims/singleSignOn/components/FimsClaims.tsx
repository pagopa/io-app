import { Divider, H6, Icon, IOColors } from "@pagopa/io-app-design-system";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import { FimsClaimType } from "../types";

export const FimsClaimsList = ({ claims }: ClaimsListProps) => (
  <View style={styles.grantsList}>
    {claims.map((claim, index) => (
      <React.Fragment key={index}>
        <ClaimListItem label={claim.display_name} />
        {index < claims.length - 1 && <Divider />}
      </React.Fragment>
    ))}
  </View>
);

const ClaimListItem = ({ label }: ClaimsListItemProps) => (
  <View style={styles.grantItem}>
    <H6>{label ?? ""}</H6>
    <Icon name="checkTickBig" size={24} color="grey-300" />
  </View>
);
type ClaimsListProps = {
  claims: ReadonlyArray<FimsClaimType>;
};
type ClaimsListItemProps = { label?: string };

const styles = StyleSheet.create({
  grantsList: {
    backgroundColor: IOColors["grey-50"],
    borderRadius: 8,
    paddingHorizontal: 24
  },
  grantItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12
  }
});
