import * as React from "react";
import { View } from "react-native";
import { WalletV2 } from "../../../../../definitions/pagopa/bancomat/WalletV2";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { Wallet } from "../../../../types/pagopa";
import { HPan } from "../store/actions/paymentMethods";
import PaymentMethodBpdToggle from "./paymentMethodActivationToggle/PaymentMethodBpdToggle";

type Props = {
  // TODO: waiting for conversion to WalletV2
  paymentList: ReadonlyArray<Wallet | WalletV2>;
};

/**
 * Render a {@link ReadOnlyArray} of {@link Wallet} using {@link PaymentMethodBpdToggle}
 * TODO: after v2, extract foreach Walletv2 the information to render the element
 * @param props
 * @constructor
 */
export const PaymentMethodBpdList: React.FunctionComponent<Props> = props => (
  <View style={IOStyles.flex}>
    {props.paymentList.map(pm => (
      <PaymentMethodBpdToggle
        key={pm.idWallet}
        // TODO: use hPan when available in v2 wallet
        // TODO: when v2 is available, extract the image and caption foreach different pm
        hPan={pm.idWallet?.toString() as HPan}
        // TODO: read from v2 wallet when ready
        hasBpdCapability={true}
      />
    ))}
  </View>
);
