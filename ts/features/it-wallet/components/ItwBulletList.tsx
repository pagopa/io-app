import * as React from "react";
import { View, StyleSheet } from "react-native";
import { Body, H6, IOColors } from "@pagopa/io-app-design-system";
import * as RA from "fp-ts/lib/ReadonlyArray";
import { pipe } from "fp-ts/lib/function";

type Props = {
  data: ReadonlyArray<BulletItem>;
};

export type BulletItem = {
  title: string;
  data: ReadonlyArray<string>;
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: IOColors.greyUltraLight,
    borderRadius: 8
  }
});
const BULLET_ITEM = "\u2022";

/**
 * A component to render a list of bullet items
 * @param data - the list of bullet items
 */
const ItwBulletList = ({ data }: Props) => (
  <View style={styles.container}>
    {pipe(
      data,
      RA.mapWithIndex((index, section) => (
        <View key={`${index}-${section.title}`}>
          <Body style={{ marginBottom: 8 }} weight="Regular" color="grey-700">
            {section.title}
          </Body>
          {section.data.map((claim, index) => (
            <View
              style={{ marginBottom: 10, paddingLeft: 8 }}
              key={`${index}-${claim}`}
            >
              <H6>{`${BULLET_ITEM} ${claim}`}</H6>
            </View>
          ))}
        </View>
      ))
    )}
  </View>
);

export default ItwBulletList;
