import * as React from "react";
import { View } from "native-base";
import { StyleSheet } from "react-native";
import TransactionIcon from "../../../../../img/wallet/payment-methods/paypal/transactions.svg";
import { H3 } from "../../../../components/core/typography/H3";
import { ImportoEuroCents } from "../../../../../definitions/backend/ImportoEuroCents";
import { H4 } from "../../../../components/core/typography/H4";
import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";
import { Label } from "../../../../components/core/typography/Label";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column"
  },
  header: {
    flexDirection: "row"
  },
  icon: {
    padding: 8
  }
});

type Props = {
  fee: ImportoEuroCents;
  pspName: string;
};

/**
 * this component show the fee associated to the current psp that handles the payment within Paypal
 * @constructor
 */
export const PayPalCheckoutPspComponent = (props: Props) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <TransactionIcon width={20} />
      <View hspacer small={true} />
      <H3>{"Costo della transazione"}</H3>
    </View>
    <View spacer={true} />
    <H4>{formatNumberCentsToAmount(props.fee, true)}</H4>
    <Label color={"bluegrey"} weight={"Regular"}>
      {`Gestito da ${props.pspName}`}
    </Label>
  </View>
);
