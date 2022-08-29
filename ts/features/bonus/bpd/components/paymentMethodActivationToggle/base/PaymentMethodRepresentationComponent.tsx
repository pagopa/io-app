import { View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { Body } from "../../../../../../components/core/typography/Body";
import { PaymentMethodRepresentation } from "../../../../../../types/pagopa";

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
  },
  text: {
    flex: 1,
    paddingRight: 16
  }
});

/**
 * Icon + text representation of a payment method
 * @param props
 * @constructor
 */
export const PaymentMethodRepresentationComponent: React.FunctionComponent<PaymentMethodRepresentation> =
  props => (
    <View style={styles.row}>
      <Image source={props.icon} style={styles.cardIcon} />
      <View hspacer={true} />
      <Body
        testID={"paymentMethodCaptionId"}
        numberOfLines={1}
        style={styles.text}
      >
        {props.caption}
      </Body>
    </View>
  );
