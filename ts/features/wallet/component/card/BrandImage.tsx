import * as React from "react";
import { Image, ImageSourcePropType, StyleSheet } from "react-native";

type Props = {
  image: ImageSourcePropType;
};

const styles = StyleSheet.create({
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
    style={styles.cardLogo}
    testID={"cardImage"}
    resizeMode="contain"
  />
);
