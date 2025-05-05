import {
  Divider,
  H6,
  Icon,
  IOColors,
  BodySmall
} from "@pagopa/io-app-design-system";
import * as RA from "fp-ts/lib/ReadonlyArray";
import { pipe } from "fp-ts/lib/function";
import { StyleSheet, View } from "react-native";
import I18n from "../../../../i18n";
import {
  ClaimDisplayFormat,
  DisclosureClaim,
  getClaimDisplayValue,
  getSafeText
} from "../../common/utils/itwClaimsUtils";
import { isStringNullyOrEmpty } from "../../../../utils/strings";

type ItwRequiredClaimsListProps = {
  items: ReadonlyArray<DisclosureClaim>;
};

const ItwRequiredClaimsList = ({ items }: ItwRequiredClaimsListProps) => (
  <View style={styles.container}>
    {pipe(
      items,
      RA.mapWithIndex((index, { claim, source }) => (
        <View key={`${index}-${claim.label}-${source}`}>
          {/* Add a separator view between sections */}
          {index !== 0 && <Divider />}
          <View style={styles.dataItem}>
            <View>
              <ClaimText claim={claim} />
              <BodySmall weight="Regular" color="grey-700">
                {I18n.t("features.itWallet.generic.dataSource.single", {
                  credentialSource: source
                })}
              </BodySmall>
            </View>
            <Icon name="checkTickBig" size={24} color="grey-300" />
          </View>
        </View>
      ))
    )}
  </View>
);

/**
 * Component which renders the claim value or multiple values in case of an array.
 * If the claim is an empty string or null, it will not render it.
 * @param claim The claim to render
 * @returns An {@link H6} element with the claim value or multiple {@link H6} elements in case of an array
 */
const ClaimText = ({ claim }: { claim: ClaimDisplayFormat }) => {
  const displayValue = getClaimDisplayValue(claim);
  return Array.isArray(displayValue) ? (
    displayValue.map((value, index) => {
      const safeValue = getSafeText(value);
      return <H6 key={`${index}_${safeValue}`}>{safeValue}</H6>;
    })
  ) : isStringNullyOrEmpty(displayValue) ? null : ( // We want to exclude empty strings and null values
    <H6>{getSafeText(displayValue)}</H6>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: IOColors["grey-50"],
    borderRadius: 8,
    paddingHorizontal: 24
  },
  dataItem: {
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  }
});

export { ItwRequiredClaimsList as ItwRequestedClaimsList };
