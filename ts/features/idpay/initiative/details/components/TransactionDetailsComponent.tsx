import React from "react";
import { Image, StyleSheet, View } from "react-native";
import {
  OperationTypeEnum as TransactionDetailOperationTypeEnum,
  TransactionDetailDTO
} from "../../../../../../definitions/idpay/timeline/TransactionDetailDTO";
import { InfoBox } from "../../../../../components/box/InfoBox";
import CopyButtonComponent from "../../../../../components/CopyButtonComponent";
import { HSpacer, VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../components/core/typography/Body";
import { H4 } from "../../../../../components/core/typography/H4";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import ItemSeparatorComponent from "../../../../../components/ItemSeparatorComponent";
import I18n from "../../../../../i18n";
import themeVariables from "../../../../../theme/variables";
import { format } from "../../../../../utils/dates";
import { formatNumberAmount } from "../../../../../utils/stringBuilder";

// TODO: this is temporary, mapping should be done on the backend
const operationCircuitTypeMap: Record<string, string> = {
  "00": "Bancomat",
  "01": "Visa",
  "02": "Mastercard",
  "03": "Amex",
  "04": "JCB",
  "05": "UnionPay",
  "06": "Diners",
  "07": "PostePay",
  "08": "BancomatPay",
  "09": "Satispay",
  "10": "PrivateCircuit"
};

type InstrumentDetailsComponentProps = Pick<
  TransactionDetailDTO,
  "brandLogo" | "maskedPan"
>;

/**
 * Displays the info of the instrument used for the transaction, with the logo of the brand and the masked pan
 * @param {InstrumentDetailsComponentProps} props
 * @returns
 */
const InstrumentDetailsComponent = (props: InstrumentDetailsComponentProps) => (
  <View style={styles.centerRow}>
    <Image style={styles.brandLogo} source={{ uri: props.brandLogo }} />
    <HSpacer size={8} />
    <Body weight="SemiBold">
      {I18n.t("idpay.initiative.operationDetails.maskedPan", {
        lastDigits: props.maskedPan
      })}
    </Body>
  </View>
);

type CopyTextProps = {
  text: string;
};

/**
 * Utility component to display a text with a CopyButtonComponent
 * @param props
 */
const CopyTextComponent = (props: CopyTextProps) => (
  <View style={[IOStyles.flex, IOStyles.row]}>
    <Body
      weight="SemiBold"
      numberOfLines={1}
      ellipsizeMode="tail"
      style={IOStyles.flex}
    >
      {props.text}
    </Body>
    <HSpacer size={8} />
    <CopyButtonComponent textToCopy={props.text} />
  </View>
);

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

  return (
    <View style={styles.container}>
      {isReversal && (
        <>
          <InfoBox>
            <Body>
              {I18n.t("idpay.initiative.operationDetails.reversalAdvice")}
            </Body>
          </InfoBox>
          <VSpacer size={16} />
        </>
      )}
      <View style={styles.detailRow}>
        <Body>{I18n.t("idpay.initiative.operationDetails.instrument")}</Body>
        <InstrumentDetailsComponent {...transaction} />
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
          {operationCircuitTypeMap[transaction.circuitType]}
        </Body>
      </View>
      <View style={styles.detailRow}>
        <Body>{I18n.t("idpay.initiative.operationDetails.acquirerId")}</Body>
        <HSpacer size={16} />
        <CopyTextComponent text={transaction.idTrxAcquirer} />
      </View>
      <View style={styles.detailRow}>
        <Body style={{ flex: 1 }}>
          {I18n.t("idpay.initiative.operationDetails.issuerId")}
        </Body>
        <HSpacer size={16} />
        <CopyTextComponent text={transaction.idTrxIssuer} />
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
  },
  brandLogo: {
    width: 24,
    height: 16
  }
});

export { TransactionDetailsComponent };
