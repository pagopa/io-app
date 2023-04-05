import React from "react";
import { StyleSheet, View } from "react-native";
import {
  TransactionDetailDTO,
  OperationTypeEnum as TransactionDetailOperationTypeEnum
} from "../../../../../../definitions/idpay/TransactionDetailDTO";
import { Alert } from "../../../../../components/Alert";
import CopyButtonComponent from "../../../../../components/CopyButtonComponent";
import ItemSeparatorComponent from "../../../../../components/ItemSeparatorComponent";
import { HSpacer, VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../components/core/typography/Body";
import { H4 } from "../../../../../components/core/typography/H4";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../i18n";
import themeVariables from "../../../../../theme/variables";
import { format } from "../../../../../utils/dates";
import { formatNumberAmount } from "../../../../../utils/stringBuilder";
import { getCardLogoComponent } from "../../../common/components/CardLogo";
import { getLabelForCircuitType } from "../../../common/labels";

type TransactionDetailsProps = {
  transaction: TransactionDetailDTO;
};

/**
 * Displays details for both `REVERSAL` and `TRANSACTION` type operation
 * @param props
 * @returns
 */
const TransactionDetailsComponent = (props: TransactionDetailsProps) => {
  const { transaction } = props;

  const isReversal =
    transaction.operationType === TransactionDetailOperationTypeEnum.REVERSAL;

  const alertViewRef = React.createRef<View>();

  return (
    <View style={styles.container}>
      {isReversal && (
        <>
          <Alert
            viewRef={alertViewRef}
            variant="info"
            content={I18n.t("idpay.initiative.operationDetails.reversalAdvice")}
          />
          <VSpacer size={16} />
        </>
      )}
      <View style={styles.detailRow}>
        <Body>{I18n.t("idpay.initiative.operationDetails.instrument")}</Body>
        <View style={styles.centerRow}>
          {getCardLogoComponent(transaction.brand)}
          <HSpacer size={8} />
          <Body weight="SemiBold">
            {I18n.t("idpay.initiative.operationDetails.maskedPan", {
              lastDigits: transaction.maskedPan
            })}
          </Body>
        </View>
      </View>
      <View style={styles.detailRow}>
        <Body>{I18n.t("idpay.initiative.operationDetails.amountLabel")}</Body>
        <Body weight="SemiBold">
          {formatNumberAmount(transaction.amount, true)}
        </Body>
      </View>
      <View style={styles.detailRow}>
        <Body>
          {I18n.t("idpay.initiative.operationDetails.accruedAmountLabel")}
        </Body>
        <Body weight="SemiBold">
          {formatNumberAmount(transaction.accrued, true)}
        </Body>
      </View>
      <ItemSeparatorComponent noPadded={true} />
      <VSpacer size={24} />
      <H4>{I18n.t("idpay.initiative.operationDetails.infoTitle")}</H4>
      <View style={styles.detailRow}>
        <Body>{I18n.t("idpay.initiative.operationDetails.date")}</Body>
        <Body weight="SemiBold">
          {format(transaction.operationDate, "DD MMM YYYY, HH:mm")}
        </Body>
      </View>
      <View style={styles.detailRow}>
        <Body>{I18n.t("idpay.initiative.operationDetails.circuit")}</Body>
        <Body weight="SemiBold">
          {getLabelForCircuitType(transaction.circuitType)}
        </Body>
      </View>
      <View style={styles.detailRow}>
        <Body>{I18n.t("idpay.initiative.operationDetails.acquirerId")}</Body>
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
          {I18n.t("idpay.initiative.operationDetails.issuerId")}
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
  container: {
    flex: 1,
    flexGrow: 1,
    paddingVertical: themeVariables.spacerHeight
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: themeVariables.spacerSmallHeight,
    paddingBottom: themeVariables.spacerSmallHeight
  },
  centerRow: {
    flexDirection: "row",
    alignItems: "center"
  }
});

export { TransactionDetailsComponent };
