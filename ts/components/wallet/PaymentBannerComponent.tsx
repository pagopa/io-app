import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { ImportoEuroCents } from "../../../definitions/backend/ImportoEuroCents";
import I18n from "../../i18n";
import variables from "../../theme/variables";
import { centsToAmount, formatNumberAmount } from "../../utils/stringBuilder";

type Props = Readonly<{
  paymentReason: string;
  currentAmount: ImportoEuroCents; // from verifica
  fee?: ImportoEuroCents;
}>;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: variables.contentPadding,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: variables.brandDarkGray
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  smallText: {
    fontSize: 14
  }
});

/**
 * This component displays a summary on the transaction.
 * Used for the screens from the identification of the transaction to the end of the procedure.
 * Fee is shown only when a method screen is selected
 */
const PaymentBannerComponent: React.SFC<Props> = props => {
  const totalAmount = props.fee
    ? (props.currentAmount as number) + (props.fee as number)
    : props.currentAmount;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text white={true} bold={true} style={styles.smallText}>
          {props.paymentReason}
        </Text>
        <Text white={true} bold={true} style={styles.smallText}>
          {formatNumberAmount(centsToAmount(props.currentAmount))}
        </Text>
      </View>
      <View style={styles.row}>
        <Text white={true} style={styles.smallText}>
          {I18n.t("wallet.ConfirmPayment.fee")}
        </Text>
        <Text white={true} style={styles.smallText}>
          {props.fee ? formatNumberAmount(centsToAmount(props.fee)) : "-"}
        </Text>
      </View>
      <View style={styles.row}>
        <Text white={true} bold={true} style={styles.smallText}>
          {I18n.t("wallet.total")}
        </Text>
        <Text white={true} bold={true}>
          {formatNumberAmount(centsToAmount(totalAmount))}
        </Text>
      </View>
    </View>
  );
};

export default PaymentBannerComponent;
