import {
  Divider,
  H6,
  Icon,
  IOColors,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { Fragment } from "react";
import { View, StyleSheet } from "react-native";
import { Claim } from "../../../../../definitions/fims_sso/Claim";

export const FimsClaimsList = ({ claims }: ClaimsListProps) => {
  const theme = useIOTheme();
  const backgroundColor = IOColors[theme["appBackground-secondary"]];

  return (
    <View style={[styles.grantsList, { backgroundColor }]}>
      {claims.map((claim, index) => (
        <Fragment key={index}>
          <ClaimListItem
            label={claim.display_name}
            iconColor={theme["icon-decorative"]}
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
    <Icon name="checkTickBig" size={24} color={iconColor} />
  </View>
);
type ClaimsListProps = {
  claims: ReadonlyArray<Claim>;
};
type ClaimsListItemProps = { label?: string; iconColor: IOColors };

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
