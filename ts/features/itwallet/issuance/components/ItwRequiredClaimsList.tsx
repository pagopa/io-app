import {
  Divider,
  H6,
  IOColors,
  Icon,
  LabelSmall
} from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet, View } from "react-native";
import * as RA from "fp-ts/lib/ReadonlyArray";
import { pipe } from "fp-ts/lib/function";
import I18n from "../../../../i18n";

export type RequiredClaim = {
  name: string;
  source: string;
};

type Props = {
  claims: ReadonlyArray<RequiredClaim>;
};

const ItwRequiredClaimsList = ({ claims }: Props) => (
  <View style={styles.container}>
    {pipe(
      claims,
      RA.mapWithIndex((index, { name, source }) => (
        <View key={`${index}-${name}-${source}`}>
          {/* Add a separator view between sections */}
          {index !== 0 && <Divider />}
          <View style={styles.dataItem}>
            <View>
              <H6>{name}</H6>
              <LabelSmall weight="Regular" color="grey-700">
                {I18n.t("features.itWallet.generic.dataSource.single", {
                  credentialSource: source
                })}
              </LabelSmall>
            </View>
            <Icon name="checkTickBig" size={24} color="grey-300" />
          </View>
        </View>
      ))
    )}
  </View>
);

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
