import * as React from "react";
import { View } from "react-native";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import { PaymentMethod } from "../../../../../../types/pagopa";
import { bpdToggleFactory } from "../BpdPaymentMethodToggleFactory";

type Props = {
  paymentList: ReadonlyArray<PaymentMethod>;
};

/**
 * Render a {@link ReadOnlyArray} of {@link EnhancedPaymentMethod} using {@link PaymentMethodBpdToggle}
 * @param props
 * @constructor
 */
export const PaymentMethodRawList: React.FunctionComponent<Props> = props => (
  <View style={IOStyles.flex}>
    {props.paymentList.map(pm => bpdToggleFactory(pm))}
  </View>
);
