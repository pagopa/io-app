import * as React from "react";
import { View } from "react-native";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { PatchedWalletV2 } from "../../../../types/pagopa";
import { bpdToggleFactory } from "./paymentMethodActivationToggle/BpdPaymentMethodToggleFactory";

type Props = {
  // TODO: waiting for conversion to WalletV2
  paymentList: ReadonlyArray<PatchedWalletV2>;
};

/**
 * Render a {@link ReadOnlyArray} of {@link Wallet} using {@link PaymentMethodBpdToggle}
 * TODO: after v2, extract foreach Walletv2 the information to render the element
 * @param props
 * @constructor
 */
export const PaymentMethodBpdList: React.FunctionComponent<Props> = props => (
  <View style={IOStyles.flex}>
    {props.paymentList.map(pm => bpdToggleFactory(pm))}
  </View>
);
