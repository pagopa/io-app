import {
  BodySmall,
  Divider,
  H6,
  HStack,
  Icon,
  IOColors,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { pipe } from "fp-ts/lib/function";
import * as RA from "fp-ts/lib/ReadonlyArray";
import I18n from "i18next";
import { StyleSheet, View } from "react-native";

import { isStringNullyOrEmpty } from "../../../../utils/strings";
import {
  ClaimDisplayFormat,
  DisclosureClaim,
  getClaimDisplayValue,
  getSafeText
} from "../../common/utils/itwClaimsUtils";

type ItwRequiredClaimsListProps = {
  items: ReadonlyArray<DisclosureClaim>;
};

const ItwRequiredClaimsList = ({ items }: ItwRequiredClaimsListProps) => {
  const theme = useIOTheme();

  const backgroundColor = IOColors[theme["appBackground-secondary"]];

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {pipe(
        items,
        RA.mapWithIndex((index, { claim, source }) => (
          <View key={`${index}-${claim.label}-${source}`}>
            {/* Add a separator view between sections */}
            {index !== 0 && <Divider />}
            <HStack
              style={{
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 12
              }}
            >
              <View>
                <ClaimText claim={claim} />
                <BodySmall color={theme["textBody-tertiary"]} weight="Regular">
                  {I18n.t("features.itWallet.generic.dataSource.single", {
                    credentialSource: source
                  })}
                </BodySmall>
              </View>
              <Icon
                color={theme["icon-decorative"]}
                name="checkTickBig"
                size={24}
              />
            </HStack>
          </View>
        ))
      )}
    </View>
  );
};

/**
 * Component which renders the claim value or multiple values in case of an array.
 * If the claim is an empty string or null, it will not render it.
 * @param claim The claim to render
 * @returns An {@link H6} element with the claim value or multiple {@link H6} elements in case of an array
 */
const ClaimText = ({ claim }: { claim: ClaimDisplayFormat }) => {
  const display = getClaimDisplayValue(claim);

  switch (display.renderAs) {
    case "list":
      return (
        <>
          {display.value.map((value, index) => {
            const safeValue = getSafeText(value);
            return <H6 key={`${index}_${safeValue}`}>{safeValue}</H6>;
          })}
        </>
      );

    case "text":
      return isStringNullyOrEmpty(display.value) ? null : ( // We want to exclude empty strings and null values
        <H6>{getSafeText(display.value)}</H6>
      );

    default:
      return null;
  }
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderCurve: "continuous",
    paddingHorizontal: 24
  }
});

export { ItwRequiredClaimsList as ItwRequestedClaimsList };
