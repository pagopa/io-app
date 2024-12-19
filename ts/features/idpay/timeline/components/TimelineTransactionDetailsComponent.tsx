import {
  Alert,
  Body,
  H6,
  HSpacer,
  ListItemInfoCopy,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { StyleSheet, View } from "react-native";
import {
  TransactionDetailDTO,
  OperationTypeEnum as TransactionTypeEnum
} from "../../../../../definitions/idpay/TransactionDetailDTO";
import ItemSeparatorComponent from "../../../../components/ItemSeparatorComponent";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { LogoPaymentWithFallback } from "../../../../components/ui/utils/components/LogoPaymentWithFallback";
import I18n from "../../../../i18n";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { format } from "../../../../utils/dates";
import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";
import { getLabelForCircuitType } from "../../common/labels";

type Props = {
  transaction: TransactionDetailDTO;
};

const TimelineTransactionDetailsComponent = (props: Props) => {
  const { transaction } = props;

  const reversalAlertComponent = pipe(
    transaction.operationType,
    O.of,
    O.filter(type => type === TransactionTypeEnum.REVERSAL),
    O.map(() => (
      <>
        <Alert
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

  const idTrxIssuer = transaction.idTrxIssuer || "";
  const idTrxAcquirer = transaction.idTrxAcquirer || "";

  const formattedAmount = pipe(
    transaction.amountCents,
    O.fromNullable,
    O.map(amount => formatNumberCentsToAmount(amount, true)),
    O.getOrElse(() => "-")
  );

  const formattedAccrued = formatNumberCentsToAmount(
    transaction.accruedCents,
    true
  );

  return (
    <View style={IOStyles.flex}>
      {reversalAlertComponent}
      <View style={styles.detailRow}>
        <Body>
          {I18n.t("idpay.initiative.operationDetails.transaction.instrument")}
        </Body>
        <View style={[IOStyles.row, IOStyles.alignCenter]}>
          <LogoPaymentWithFallback
            brand={transaction.brand}
            isExtended={false}
          />
          <HSpacer size={8} />
          <Body weight="Semibold">
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
        <Body weight="Semibold">{formattedAmount}</Body>
      </View>
      <View style={styles.detailRow}>
        <Body>
          {I18n.t(
            "idpay.initiative.operationDetails.transaction.accruedAmountLabel"
          )}
        </Body>
        <Body weight="Semibold">{formattedAccrued}</Body>
      </View>
      <ItemSeparatorComponent noPadded={true} />
      <VSpacer size={24} />
      <H6>
        {I18n.t("idpay.initiative.operationDetails.transaction.infoTitle")}
      </H6>
      <VSpacer size={4} />
      <View style={styles.detailRow}>
        <Body>
          {I18n.t("idpay.initiative.operationDetails.transaction.date")}
        </Body>
        <Body weight="Semibold">
          {format(transaction.operationDate, "DD MMM YYYY, HH:mm")}
        </Body>
      </View>
      <View style={styles.detailRow}>
        <Body>
          {I18n.t("idpay.initiative.operationDetails.transaction.circuit")}
        </Body>
        <Body weight="Semibold">
          {getLabelForCircuitType(transaction.circuitType)}
        </Body>
      </View>
      <ListItemInfoCopy
        label={I18n.t(
          "idpay.initiative.operationDetails.transaction.acquirerId"
        )}
        value={idTrxAcquirer}
        onPress={() => {
          clipboardSetStringWithFeedback(idTrxAcquirer);
        }}
      />
      <ListItemInfoCopy
        label={I18n.t("idpay.initiative.operationDetails.transaction.issuerId")}
        value={idTrxIssuer}
        onPress={() => {
          clipboardSetStringWithFeedback(idTrxIssuer);
        }}
      />
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
