import { fromNullable } from "fp-ts/lib/Option";
import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { ImportoEuroCents } from "../../../definitions/backend/ImportoEuroCents";
import I18n from "../../i18n";
import variables from "../../theme/variables";
import { formatNumberCentsToAmount } from "../../utils/stringBuilder";

type Props = Readonly<{
  paymentReason: string;
  currentAmount: ImportoEuroCents;
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
  },
  flex: {
    flex: 1
  }
});

const noFee = "-";

/**
 * This component displays a summary on the transaction.
 * Used for the screens from the identification of the transaction to the end of the procedure.
 * Fee is shown only when a method screen is selected
 */
const PaymentBannerComponent: React.SFC<Props> = props => {
  const totalAmount = fromNullable(props.fee).fold(
    props.currentAmount,
    fee => (props.currentAmount as number) + (fee as number)
  );
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text
          white={true}
          bold={true}
          style={[styles.smallText, styles.flex]}
          numberOfLines={1}
        >
          {props.paymentReason}
        </Text>
        <Text white={true} bold={true} style={styles.smallText}>
          {formatNumberCentsToAmount(props.currentAmount, true)}
        </Text>
      </View>
      <View style={styles.row}>
        <Text white={true} style={styles.smallText}>
          {I18n.t("wallet.ConfirmPayment.fee")}
        </Text>
        <Text white={true} style={styles.smallText}>
          {props.fee ? formatNumberCentsToAmount(props.fee, true) : noFee}
        </Text>
      </View>
      <View style={styles.row}>
        <Text white={true} bold={true} style={styles.smallText}>
          {I18n.t("wallet.total")}
        </Text>
        <Text white={true} bold={true}>
          {props.fee ? formatNumberCentsToAmount(totalAmount, true) : noFee}
        </Text>
      </View>
    </View>
  );
};

export default PaymentBannerComponent;
