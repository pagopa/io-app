import { Fragment } from "react";
import { StyleSheet, View } from "react-native";
import { pipe } from "fp-ts/lib/function";
import * as RA from "fp-ts/lib/ReadonlyArray";
import { Divider, IOColors } from "@pagopa/io-app-design-system";
import { ClaimDisplayFormat } from "../../utils/itwClaimsUtils";
import { ItwOptionalClaim } from "./ItwOptionalClaim";
import { ItwStaticClaim } from "./ItwStaticClaim";

export type DisclosureClaim = {
  claim: ClaimDisplayFormat;
  source: string;
};

type ItwRequiredClaimsListProps = {
  items: ReadonlyArray<DisclosureClaim>;
};

type ItwOptionalClaimsListProps = {
  items: ReadonlyArray<DisclosureClaim>;
  selectedClaims: Array<string>;
  onSelectionChange: (claimId: string) => void;
};

/**
 * List of optional claims that can be disclosed for issuance/presentation.
 * These claims are selectable with a checkbox.
 */
const ItwOptionalClaimsList = ({
  items,
  selectedClaims,
  onSelectionChange
}: ItwOptionalClaimsListProps) => (
  <View style={styles.container}>
    {pipe(
      items,
      RA.mapWithIndex((index, { claim, source }) => (
        <Fragment key={`${index}-${claim.id}-${source}`}>
          {/* Add a separator view between sections */}
          {index !== 0 && <Divider />}
          <ItwOptionalClaim
            claim={claim}
            source={source}
            checked={selectedClaims.includes(claim.id)}
            onPress={onSelectionChange}
            unavailable={false}
          />
        </Fragment>
      ))
    )}
  </View>
);

/**
 * List of required claims that must be disclosed for issuance/presentation.
 */
const ItwRequiredClaimsList = ({ items }: ItwRequiredClaimsListProps) => (
  <View style={styles.container}>
    {pipe(
      items,
      RA.mapWithIndex((index, { claim, source }) => (
        <Fragment key={`${index}-${claim.id}-${source}`}>
          {/* Add a separator view between sections */}
          {index !== 0 && <Divider />}
          <ItwStaticClaim claim={claim} source={source} />
        </Fragment>
      ))
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: IOColors["grey-50"],
    borderRadius: 8,
    paddingHorizontal: 24
  }
});

export { ItwRequiredClaimsList, ItwOptionalClaimsList };
