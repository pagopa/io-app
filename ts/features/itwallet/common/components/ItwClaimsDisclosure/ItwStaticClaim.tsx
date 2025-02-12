import { StyleSheet, View } from "react-native";
import { BodySmall, Icon } from "@pagopa/io-app-design-system";
import { ClaimDisplayFormat } from "../../utils/itwClaimsUtils";
import I18n from "../../../../../i18n";
import { ClaimText } from "./ItwClaimText";

type ItwStaticClaimProps = {
  claim: ClaimDisplayFormat;
  source: string;
  unavailable?: boolean;
};

/**
 * A read-only claim that cannot be interacted with.
 */
export const ItwStaticClaim = ({
  claim,
  source,
  unavailable
}: ItwStaticClaimProps) => (
  <View style={styles.dataItem}>
    <View>
      <ClaimText claim={claim} />
      <BodySmall weight="Regular" color="grey-700">
        {I18n.t(
          unavailable
            ? "features.itWallet.presentation.selectiveDisclosure.claimUnavailable"
            : "features.itWallet.generic.dataSource.single",
          { credentialSource: source }
        )}
      </BodySmall>
    </View>
    <Icon
      name={unavailable ? "closeLarge" : "checkTickBig"}
      size={24}
      color="grey-300"
    />
  </View>
);

const styles = StyleSheet.create({
  dataItem: {
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  }
});
