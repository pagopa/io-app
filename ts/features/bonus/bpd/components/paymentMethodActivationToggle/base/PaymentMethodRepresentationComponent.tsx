import * as React from "react";
import { View, Image, StyleSheet } from "react-native";
import { HSpacer } from "../../../../../../components/core/spacer/Spacer";
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
      <HSpacer size={16} />
      <Body
        testID={"paymentMethodCaptionId"}
        numberOfLines={1}
        style={styles.text}
      >
        {props.caption}
      </Body>
    </View>
  );
