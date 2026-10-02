import {
  TransactionDetailDTO,
  StatusEnum as TransactionStatusEnum
} from "@io-app/api-types/generated/definitions/idpay/TransactionDetailDTO";
import {
  Alert,
  Divider,
  ListItemHeader,
  ListItemInfo,
  ListItemInfoCopy,
  VSpacer
} from "@io-app/design-system";
import I18n from "i18next";
import { View } from "react-native";

import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { format } from "../../../../utils/dates";
import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";

type Props = {
  transaction: TransactionDetailDTO;
};

const getTransactionStatusLabel = (status: TransactionStatusEnum): string => {
  switch (status) {
    case TransactionStatusEnum.AUTHORIZED:
      return I18n.t(
        "idpay.initiative.operationDetails.discount.labels.AUTHORIZED"
      );
    case TransactionStatusEnum.CANCELLED:
      return I18n.t(
        "idpay.initiative.operationDetails.discount.labels.CANCELLED"
      );
    case TransactionStatusEnum.CAPTURED:
      return I18n.t(
        "idpay.initiative.operationDetails.discount.labels.CAPTURED"
      );
    case TransactionStatusEnum.REFUNDED:
      return I18n.t(
        "idpay.initiative.operationDetails.discount.labels.REFUNDED"
      );
    case TransactionStatusEnum.REWARDED:
      return I18n.t(
        "idpay.initiative.operationDetails.discount.labels.REWARDED"
      );
  }
};

const IdPayTimelineDiscountTransactionDetailsComponent = (props: Props) => {
  const { transaction } = props;

  const statusAlertComponent =
    transaction.status === TransactionStatusEnum.CANCELLED ? (
      <>
        <Alert
          content={I18n.t(
            "idpay.initiative.operationDetails.discount.details.alerts.CANCELLED"
          )}
          variant="info"
        />
        <VSpacer size={16} />
      </>
    ) : null;

  const formattedAmount = transaction.amountCents
    ? formatNumberCentsToAmount(transaction.amountCents, true)
    : "-";

  const businessName = transaction.businessName ?? "-";

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
        numberOfLines={2}
        value={businessName}
      />
      <Divider />
      <ListItemInfo
        label={I18n.t(
          "idpay.initiative.operationDetails.discount.details.labels.status"
        )}
        value={getTransactionStatusLabel(transaction.status)}
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
        onPress={() => {
          clipboardSetStringWithFeedback(transaction.operationId);
        }}
        value={transaction.operationId}
      />
    </View>
  );
};

export { IdPayTimelineDiscountTransactionDetailsComponent };
