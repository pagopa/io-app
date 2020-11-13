import * as React from "react";
import { View } from "react-native";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import { PatchedWalletV2 } from "../../../../../../types/pagopa";
import { bpdToggleFactory } from "../BpdPaymentMethodToggleFactory";

type Props = {
  paymentList: ReadonlyArray<PatchedWalletV2>;
};

/**
 * Render a {@link ReadOnlyArray} of {@link Wallet} using {@link PaymentMethodBpdToggle}
 * @param props
 * @constructor
 */
export const PaymentMethodRawList: React.FunctionComponent<Props> = props => (
  <View style={IOStyles.flex}>
    {props.paymentList.map(pm => bpdToggleFactory(pm))}
  </View>
);
