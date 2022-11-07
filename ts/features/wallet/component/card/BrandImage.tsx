import * as React from "react";
import { Image, ImageSourcePropType, StyleSheet } from "react-native";

type Props = {
  image: ImageSourcePropType;
  scale?: number;
};

const styles = StyleSheet.create({
  // TODO: Remove this unused style, use const variables instead
  // eslint-disable-next-line react-native/no-unused-styles
  cardLogo: {
    height: 30,
    width: 48
  }
});

/**
 * Represent in a standard way the brand for a payment method (eg: Visa logo, Mastercard logo, etc.)
 * @param props
 * @constructor
 */
export const BrandImage = (props: Props): React.ReactElement => (
  <Image
    source={props.image}
    style={{
      width: styles.cardLogo.width * (props.scale ?? 1),
      height: styles.cardLogo.height * (props.scale ?? 1)
    }}
    testID={"cardImage"}
    resizeMode="contain"
  />
);
