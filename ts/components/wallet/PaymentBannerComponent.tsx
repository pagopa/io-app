import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import { ImportoEuroCents } from "../../../definitions/backend/ImportoEuroCents";
import I18n from "../../i18n";
import { formatNumberCentsToAmount } from "../../utils/stringBuilder";
import { Body } from "../core/typography/Body";
import { Label } from "../core/typography/Label";
import { IOColors } from "../core/variables/IOColors";
import { IOStyles } from "../core/variables/IOStyles";

type Props = Readonly<{
  paymentReason: string;
  currentAmount: ImportoEuroCents;
  fee?: ImportoEuroCents;
}>;

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: IOColors.bluegrey
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
    <View style={[styles.container, IOStyles.horizontalContentPadding]}>
      <View style={IOStyles.rowSpaceBetween}>
        <View style={IOStyles.flex}>
          <Label color="white" weight="Bold" numberOfLines={1}>
            {props.paymentReason}
          </Label>
        </View>
        <Label color="white" weight="Bold">
          {formatNumberCentsToAmount(props.currentAmount, true)}
        </Label>
      </View>
      <View style={IOStyles.rowSpaceBetween}>
        <Body color="white">{I18n.t("wallet.ConfirmPayment.fee")}</Body>
        <Body color="white" testID={"PaymentBannerComponentFee"}>
          {formatNumberCentsToAmount(props.fee ?? 0, true)}
        </Body>
      </View>
      <View style={IOStyles.rowSpaceBetween}>
        <Label color="white" weight="Bold">
          {I18n.t("wallet.total")}
        </Label>
        <Label
          color="white"
          weight="Bold"
          testID={"PaymentBannerComponentTotal"}
        >
          {formatNumberCentsToAmount(totalAmount, true)}
        </Label>
      </View>
    </View>
  );
};

export default PaymentBannerComponent;
