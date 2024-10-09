import { Alert, HSpacer, VSpacer } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { StyleSheet, View } from "react-native";
import {
  TransactionDetailDTO,
  StatusEnum as TransactionStatusEnum
} from "../../../../../definitions/idpay/TransactionDetailDTO";
import CopyButtonComponent from "../../../../components/CopyButtonComponent";
import ItemSeparatorComponent from "../../../../components/ItemSeparatorComponent";
import { Body } from "../../../../components/core/typography/Body";
import { H4 } from "../../../../components/core/typography/H4";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import I18n from "../../../../i18n";
import { format } from "../../../../utils/dates";
import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";

type Props = {
  transaction: TransactionDetailDTO;
};

const TimelineDiscountTransactionDetailsComponent = (props: Props) => {
  const { transaction } = props;

  const statusAlertComponent = pipe(
    transaction.status,
    O.of,
    O.map(status => {
      switch (status) {
        case TransactionStatusEnum.CANCELLED:
          return (
            <>
              <Alert
                variant="error"
                content={I18n.t(
                  "idpay.initiative.operationDetails.discount.details.alerts.CANCELLED"
                )}
              />
              <VSpacer size={16} />
            </>
          );
        default:
          return null;
      }
    }),
    O.toNullable
  );

  const formattedAmount = pipe(
    transaction.amountCents,
    O.fromNullable,
    O.map(amount => formatNumberCentsToAmount(amount, true)),
    O.getOrElse(() => "-")
  );

  const businessName = pipe(
    transaction.businessName,
    O.fromNullable,
    O.getOrElse(() => "-")
  );

  return (
    <View style={IOStyles.flex}>
      <VSpacer size={8} />
      {statusAlertComponent}
      <View style={styles.detailRow}>
        <Body>
          {I18n.t(
            "idpay.initiative.operationDetails.discount.details.labels.totalAmount"
          )}
        </Body>
        <Body weight="Semibold">{formattedAmount}</Body>
      </View>
      <View style={styles.detailRow}>
        <Body>
          {I18n.t(
            "idpay.initiative.operationDetails.discount.details.labels.idpayAmount"
          )}
        </Body>
        <Body weight="Semibold">
          {formatNumberCentsToAmount(transaction.accruedCents, true)}
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
          {I18n.t(
            "idpay.initiative.operationDetails.discount.details.labels.business"
          )}
        </Body>
        <HSpacer size={16} />
        <Body
          weight="Semibold"
          numberOfLines={2}
          style={{ flex: 1, textAlign: "right" }}
        >
          {businessName}
        </Body>
      </View>
      <View style={styles.detailRow}>
        <Body>
          {I18n.t(
            "idpay.initiative.operationDetails.discount.details.labels.status"
          )}
        </Body>
        <Body weight="Semibold">
          {I18n.t(
            `idpay.initiative.operationDetails.discount.labels.${transaction.status}`
          )}
        </Body>
      </View>
      <View style={styles.detailRow}>
        <Body>
          {I18n.t("idpay.initiative.operationDetails.transaction.date")}
        </Body>
        <Body weight="Semibold">
          {format(transaction.operationDate, "DD MMM YYYY, HH:mm")}
        </Body>
      </View>
      <View style={styles.detailRow}>
        <Body style={{ flex: 1 }}>
          {I18n.t(
            "idpay.initiative.operationDetails.discount.details.labels.transactionID"
          )}
        </Body>
        <HSpacer size={16} />
        <View style={[IOStyles.flex, IOStyles.row]}>
          <Body
            weight="Semibold"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={IOStyles.flex}
          >
            {transaction.operationId}
          </Body>
          <HSpacer size={8} />
          <CopyButtonComponent textToCopy={transaction.operationId} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8
  }
});

export { TimelineDiscountTransactionDetailsComponent };
