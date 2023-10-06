import { Body, H6, IOColors } from "@pagopa/io-app-design-system";
import * as React from "react";
import { View } from "react-native";
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

/**
 * A component to render a list of bullet items
 * @param data the list of bullet items should be the list of credentials request by the issuer
 */
const ItwBulletList = ({ data }: Props) => (
  <View
    style={{
      padding: 24,
      backgroundColor: IOColors.greyUltraLight,
      borderRadius: 8
    }}
  >
    {pipe(
      data,
      RA.mapWithIndex((index, section) => (
        <View key={index}>
          <Body style={{ marginBottom: 8 }} weight="Regular" color="grey-700">
            {section.title}
          </Body>
          {section.data.map((claim, index) => (
            <>
              <View style={{ marginBottom: 10 }} key={index}>
                <H6>{`${BULLET_ITEM} ${claim}`}</H6>
              </View>
            </>
          ))}
        </View>
      ))
    )}
  </View>
);

export default ItwBulletList;
