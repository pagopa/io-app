import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { StyleSheet, View } from "react-native";
import {
  OperationTypeEnum as TransactionTypeEnum,
  TransactionDetailDTO
} from "../../../../../../definitions/idpay/TransactionDetailDTO";
import { Alert } from "../../../../../components/Alert";
import CopyButtonComponent from "../../../../../components/CopyButtonComponent";
import ItemSeparatorComponent from "../../../../../components/ItemSeparatorComponent";
import { HSpacer, VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../components/core/typography/Body";
import { H4 } from "../../../../../components/core/typography/H4";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../i18n";
import { format } from "../../../../../utils/dates";
import { formatNumberAmount } from "../../../../../utils/stringBuilder";
import { getCardLogoComponent } from "../../../common/components/CardLogo";
import { getLabelForCircuitType } from "../../../common/labels";

type Props = {
  transaction: TransactionDetailDTO;
};

const TimelineTransactionDetailsComponent = (props: Props) => {
  const { transaction } = props;

  const alertViewRef = React.createRef<View>();

  const reversalAlertComponent = pipe(
    transaction.operationType,
    O.of,
    O.filter(type => type === TransactionTypeEnum.REVERSAL),
    O.map(() => (
      <>
        <Alert
          viewRef={alertViewRef}
          variant="info"
          content={I18n.t(
            "idpay.initiative.operationDetails.transaction.reversalAdvice"
          )}
        />
        <VSpacer size={16} />
      </>
    )),
    O.toNullable
  );

  return (
    <View style={IOStyles.flex}>
      <VSpacer size={8} />
      {reversalAlertComponent}
      <View style={styles.detailRow}>
        <Body>
          {I18n.t("idpay.initiative.operationDetails.transaction.instrument")}
        </Body>
        <View style={[IOStyles.row, IOStyles.alignCenter]}>
          {getCardLogoComponent(transaction.brand)}
          <HSpacer size={8} />
          <Body weight="SemiBold">
            {I18n.t("idpay.initiative.operationDetails.transaction.maskedPan", {
              lastDigits: transaction.maskedPan
            })}
          </Body>
        </View>
      </View>
      <View style={styles.detailRow}>
        <Body>
          {I18n.t("idpay.initiative.operationDetails.transaction.amountLabel")}
        </Body>
        <Body weight="SemiBold">
          {formatNumberAmount(transaction.amount, true)}
        </Body>
      </View>
      <View style={styles.detailRow}>
        <Body>
          {I18n.t(
            "idpay.initiative.operationDetails.transaction.accruedAmountLabel"
          )}
        </Body>
        <Body weight="SemiBold">
          {formatNumberAmount(transaction.accrued, true)}
        </Body>
      </View>
      <ItemSeparatorComponent noPadded={true} />
      <VSpacer size={24} />
      <H4>
        {I18n.t("idpay.initiative.operationDetails.transaction.infoTitle")}
      </H4>
      <VSpacer size={4} />
      <View style={styles.detailRow}>
        <Body>
          {I18n.t("idpay.initiative.operationDetails.transaction.date")}
        </Body>
        <Body weight="SemiBold">
          {format(transaction.operationDate, "DD MMM YYYY, HH:mm")}
        </Body>
      </View>
      <View style={styles.detailRow}>
        <Body>
          {I18n.t("idpay.initiative.operationDetails.transaction.circuit")}
        </Body>
        <Body weight="SemiBold">
          {getLabelForCircuitType(transaction.circuitType)}
        </Body>
      </View>
      <View style={styles.detailRow}>
        <Body>
          {I18n.t("idpay.initiative.operationDetails.transaction.acquirerId")}
        </Body>
        <HSpacer size={16} />
        <View style={[IOStyles.flex, IOStyles.row]}>
          <Body
            weight="SemiBold"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={IOStyles.flex}
          >
            {transaction.idTrxAcquirer}
          </Body>
          <HSpacer size={8} />
          <CopyButtonComponent textToCopy={transaction.idTrxAcquirer} />
        </View>
      </View>
      <View style={styles.detailRow}>
        <Body style={{ flex: 1 }}>
          {I18n.t("idpay.initiative.operationDetails.transaction.issuerId")}
        </Body>
        <HSpacer size={16} />
        <View style={[IOStyles.flex, IOStyles.row]}>
          <Body
            weight="SemiBold"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={IOStyles.flex}
          >
            {transaction.idTrxIssuer}
          </Body>
          <HSpacer size={8} />
          <CopyButtonComponent textToCopy={transaction.idTrxIssuer} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8
  }
});

export { TimelineTransactionDetailsComponent };
