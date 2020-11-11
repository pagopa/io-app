import { View } from "native-base";
import * as React from "react";
import { Image, ImageSourcePropType, StyleSheet } from "react-native";
import { Body } from "../../../../../../components/core/typography/Body";

type Props = {
  icon: ImageSourcePropType;
  caption: string;
};

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: "row"
  },
  cardIcon: {
    width: 40,
    height: 25,
    overflow: "hidden",
    resizeMode: "contain"
  }
});

/**
 * Icon + text representation of a payment method
 * @param props
 * @constructor
 */
export const PaymentMethodRepresentation: React.FunctionComponent<Props> = props => (
  <View style={styles.row}>
    <Image source={props.icon} style={styles.cardIcon} />
    <View hspacer={true} />
    <Body>{props.caption}</Body>
  </View>
);
