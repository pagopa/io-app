import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Text as NBText } from "native-base";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import { ImportoEuroCents } from "../../../definitions/backend/ImportoEuroCents";
import I18n from "../../i18n";
import variables from "../../theme/variables";
import { formatNumberCentsToAmount } from "../../utils/stringBuilder";
import { IOColors } from "../core/variables/IOColors";

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
    backgroundColor: IOColors.bluegrey
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  flex: {
    flex: 1
  }
});

/**
 * This component displays a summary on the transaction.
 * Used for the screens from the identification of the transaction to the end of the procedure.
 * Fee is shown only when a method screen is selected
 */
const PaymentBannerComponent: React.SFC<Props> = props => {
  const totalAmount = pipe(
    props.fee,
    O.fromNullable,
    O.fold(
      () => props.currentAmount,
      fee => (props.currentAmount as number) + (fee as number)
    )
  );
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <NBText white={true} bold={true} style={styles.flex} numberOfLines={1}>
          {props.paymentReason}
        </NBText>
        <NBText white={true} bold={true}>
          {formatNumberCentsToAmount(props.currentAmount, true)}
        </NBText>
      </View>
      <View style={styles.row}>
        <NBText white={true}>{I18n.t("wallet.ConfirmPayment.fee")}</NBText>
        <NBText white={true} testID={"PaymentBannerComponentFee"}>
          {formatNumberCentsToAmount(props.fee ?? 0, true)}
        </NBText>
      </View>
      <View style={styles.row}>
        <NBText white={true} bold={true}>
          {I18n.t("wallet.total")}
        </NBText>
        <NBText white={true} bold={true} testID={"PaymentBannerComponentTotal"}>
          {formatNumberCentsToAmount(totalAmount, true)}
        </NBText>
      </View>
    </View>
  );
};

export default PaymentBannerComponent;
