import { Claim } from "@io-app/api-types/generated/definitions/fims_sso/Claim";
import {
  Divider,
  H6,
  Icon,
  IOTokenColor,
  useIOColors
} from "@io-app/design-system";
import { Fragment } from "react";
import { StyleSheet, View } from "react-native";

export const FimsClaimsList = ({ claims }: ClaimsListProps) => {
  const colors = useIOColors();
  const backgroundColor = colors.surface.secondary;

  return (
    <View style={[styles.grantsList, { backgroundColor }]}>
      {claims.map((claim, index) => (
        <Fragment key={index}>
          <ClaimListItem
            iconColor={colors.icon.decorative}
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
type ClaimsListItemProps = { iconColor: IOTokenColor; label?: string };
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
