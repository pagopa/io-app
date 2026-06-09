import {
  Alert,
  Divider,
  ListItemHeader,
  ListItemInfo,
  ListItemInfoCopy,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { View } from "react-native";
import I18n from "i18next";
import {
  TransactionDetailDTO,
  StatusEnum as TransactionStatusEnum
} from "../../../../../definitions/idpay/TransactionDetailDTO";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { format } from "../../../../utils/dates";
import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";

type Props = {
  transaction: TransactionDetailDTO;
};

const IdPayTimelineDiscountTransactionDetailsComponent = (props: Props) => {
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
                variant="info"
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
    <View style={{ flex: 1 }}>
      <VSpacer size={8} />
      {statusAlertComponent}
      <ListItemInfo
        label={I18n.t(
          "idpay.initiative.operationDetails.discount.details.labels.totalAmount"
        )}
        value={formattedAmount}
      />
      <Divider />
      <ListItemInfo
        label={I18n.t(
          "idpay.initiative.operationDetails.discount.details.labels.idpayAmount"
        )}
        value={formatNumberCentsToAmount(transaction.accruedCents, true)}
      />
      <ListItemHeader
        label={I18n.t(
          "idpay.initiative.operationDetails.transaction.infoTitle"
        )}
      />
      <ListItemInfo
        label={I18n.t(
          "idpay.initiative.operationDetails.discount.details.labels.business"
        )}
        value={businessName}
        numberOfLines={2}
      />
      <Divider />
      <ListItemInfo
        label={I18n.t(
          "idpay.initiative.operationDetails.discount.details.labels.status"
        )}
        value={I18n.t(
          `idpay.initiative.operationDetails.discount.labels.${transaction.status}`
        )}
      />
      <Divider />
      <ListItemInfo
        label={I18n.t("idpay.initiative.operationDetails.transaction.date")}
        value={format(transaction.operationDate, "DD MMM YYYY, HH:mm")}
      />
      <Divider />
      <ListItemInfoCopy
        label={I18n.t(
          "idpay.initiative.operationDetails.discount.details.labels.transactionID"
        )}
        value={transaction.operationId}
        onPress={() => {
          clipboardSetStringWithFeedback(transaction.operationId);
        }}
      />
    </View>
  );
};

export { IdPayTimelineDiscountTransactionDetailsComponent };
