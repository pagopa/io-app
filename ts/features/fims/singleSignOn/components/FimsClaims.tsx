import {
  Divider,
  H6,
  Icon,
  IOColors,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { Fragment } from "react";
import { StyleSheet, View } from "react-native";

import { Claim } from "../../../../../definitions/fims_sso/Claim";

export const FimsClaimsList = ({ claims }: ClaimsListProps) => {
  const theme = useIOTheme();
  const backgroundColor = IOColors[theme["appBackground-secondary"]];

  return (
    <View style={[styles.grantsList, { backgroundColor }]}>
      {claims.map((claim, index) => (
        <Fragment key={index}>
          <ClaimListItem
            iconColor={theme["icon-decorative"]}
            label={claim.display_name}
          />
          {index < claims.length - 1 && <Divider />}
        </Fragment>
      ))}
    </View>
  );
};

const ClaimListItem = ({ label, iconColor }: ClaimsListItemProps) => (
  <View style={styles.grantItem}>
    <H6>{label ?? ""}</H6>
    <Icon color={iconColor} name="checkTickBig" size={24} />
  </View>
);
type ClaimsListItemProps = { iconColor: IOColors; label?: string };
type ClaimsListProps = {
  claims: ReadonlyArray<Claim>;
};

const styles = StyleSheet.create({
  grantsList: {
    borderRadius: 8,
    paddingHorizontal: 24
  },
  grantItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12
  }
});
