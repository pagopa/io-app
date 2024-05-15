import * as React from "react";
import { View, StyleSheet } from "react-native";
import { Body, Divider, H6, IOColors } from "@pagopa/io-app-design-system";
import * as RA from "fp-ts/lib/ReadonlyArray";
import { pipe } from "fp-ts/lib/function";

type Props = {
  data: ReadonlyArray<BulletItem>;
};

export type BulletItem = {
  title: string;
  data: ReadonlyArray<string>;
};

const BULLET_ITEM = "\u2022";

const BULLET_ITEM_INDENTATION = 8;

const VERTICAL_SPACING = 12;

const HORIZONTAL_SPACING = 24;

const styles = StyleSheet.create({
  container: {
    backgroundColor: IOColors.greyUltraLight,
    borderRadius: 8,
    paddingHorizontal: HORIZONTAL_SPACING
  },
  innerContainer: {
    paddingVertical: VERTICAL_SPACING
  },
  bulletItem: {
    marginBottom: VERTICAL_SPACING,
    paddingLeft: BULLET_ITEM_INDENTATION
  },
  lastBulletItem: {
    paddingLeft: BULLET_ITEM_INDENTATION
  }
});

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
          <View style={styles.innerContainer}>
            <Body style={{ marginBottom: 8 }} weight="Regular" color="grey-700">
              {section.title}
            </Body>
            {section.data.map((claim, index) => (
              <View
                style={
                  index !== section.data.length - 1
                    ? styles.bulletItem
                    : styles.lastBulletItem
                }
                key={`${index}-${claim}`}
              >
                <H6>{`${BULLET_ITEM} ${claim}`}</H6>
              </View>
            ))}
          </View>
          {/* Add a separator view between sections */}
          {index !== data.length - 1 && <Divider />}
        </View>
      ))
    )}
  </View>
);

export default ItwBulletList;
