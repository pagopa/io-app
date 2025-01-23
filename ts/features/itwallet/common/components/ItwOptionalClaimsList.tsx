import { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import {
  AnimatedCheckbox,
  Body,
  Divider,
  H6,
  IOColors
} from "@pagopa/io-app-design-system";
import * as RA from "fp-ts/lib/ReadonlyArray";
import { pipe } from "fp-ts/lib/function";
import I18n from "../../../../i18n";

/**
 * Props for {@link ItwOptionalClaimsList} component which consists of a list of claims
 * and a callback function to be called when a claim is selected.
 */
type Props = {
  claims: ReadonlyArray<ItwOptionalClaimItem>;
  onClaimSelected?: (claim: ItwOptionalClaimItem, isSelected: boolean) => void;
};

/**
 * Type for a claim item.
 */
export type ItwOptionalClaimItem = {
  claim: string;
  credential: string;
};

const VERTICAL_SPACING = 16;

const HORIZONTAL_SPACING = 24;

/**
 * A component to render a list of optional claims with a checkbox.
 * @param claims - the list of the optional claims
 * @param onClaimSelected - the callback function to be called when a claim is selected
 */
export const ItwOptionalClaimsList = ({ claims, onClaimSelected }: Props) => {
  const [selectedClaims, setSelectedClaims] = useState<Array<boolean>>(
    new Array(claims.length).fill(false)
  );

  const checkBoxOnPress = (index: number) => {
    if (onClaimSelected) {
      onClaimSelected(claims[index], !selectedClaims[index]);
    }
    setSelectedClaims(
      selectedClaims.map((value, i) => (i === index ? !value : value))
    );
  };

  return (
    <View style={styles.container}>
      {pipe(
        claims,
        RA.mapWithIndex((index, claim) => (
          <View key={`${index}-${claim.claim}`}>
            <Pressable
              accessibilityRole="button"
              onPress={() => checkBoxOnPress(index)}
            >
              <View style={styles.innerContainer}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between"
                  }}
                >
                  <H6>{claim.claim}</H6>
                  <View pointerEvents="none">
                    <AnimatedCheckbox checked={selectedClaims[index]} />
                  </View>
                </View>
                <Body>
                  {I18n.t("features.itWallet.generic.dataSource.single", {
                    authSource: claim.credential
                  })}
                </Body>
              </View>
            </Pressable>
            {/* Add a separator view between claims */}
            {index !== claims.length - 1 && <Divider />}
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: IOColors["grey-50"],
    borderRadius: 8,
    paddingHorizontal: HORIZONTAL_SPACING
  },
  innerContainer: {
    paddingVertical: VERTICAL_SPACING
  }
});
