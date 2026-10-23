import {
  TransactionDetailDTO,
  OperationTypeEnum as TransactionTypeEnum
} from "@io-app/api-types/generated/definitions/idpay/TransactionDetailDTO";
import {
  Alert,
  Divider,
  IOLogoPaymentType,
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
import { getLabelForCircuitType } from "../../common/labels";

type Props = {
  transaction: TransactionDetailDTO;
};

const IdPayTimelineTransactionDetailsComponent = (props: Props) => {
  const { transaction } = props;

  const reversalAlertComponent =
    transaction.operationType === TransactionTypeEnum.REVERSAL ? (
      <>
        <Alert
          content={I18n.t(
            "idpay.initiative.operationDetails.transaction.reversalAdvice"
          )}
          variant="info"
        />
        <VSpacer size={16} />
      </>
    ) : null;

  const idTrxIssuer = transaction.idTrxIssuer || "";
  const idTrxAcquirer = transaction.idTrxAcquirer || "";

  const formattedAmount =
    transaction.amountCents !== undefined
      ? formatNumberCentsToAmount(transaction.amountCents, true)
      : "-";

  const formattedAccrued = formatNumberCentsToAmount(
    transaction.accruedCents,
    true
  );

  return (
    <View style={{ flex: 1 }}>
      {reversalAlertComponent}
      <ListItemInfo
        label={I18n.t("transaction.details.info.paymentMethod")}
        paymentLogoIcon={
          getLabelForCircuitType(transaction.circuitType) as IOLogoPaymentType
        }
        value={I18n.t(
          "idpay.initiative.operationDetails.transaction.maskedPan",
          {
            lastDigits: transaction.maskedPan
          }
        )}
      />
      <Divider />
      <ListItemInfo
        label={I18n.t(
          "idpay.initiative.operationDetails.transaction.amountLabel"
        )}
        value={formattedAmount}
      />
      <Divider />
      <ListItemInfo
        label={I18n.t(
          "idpay.initiative.operationDetails.transaction.accruedAmountLabel"
        )}
        value={formattedAccrued}
      />
      <ListItemHeader
        label={I18n.t(
          "idpay.initiative.operationDetails.transaction.infoTitle"
        )}
      />
      <ListItemInfo
        label={I18n.t("idpay.initiative.operationDetails.transaction.date")}
        value={format(transaction.operationDate, "DD MMM YYYY, HH:mm")}
      />
      <Divider />
      <ListItemInfo
        label={I18n.t("idpay.initiative.operationDetails.transaction.circuit")}
        value={getLabelForCircuitType(transaction.circuitType)}
      />
      <Divider />
      <ListItemInfoCopy
        label={I18n.t(
          "idpay.initiative.operationDetails.transaction.acquirerId"
        )}
        onPress={() => {
          clipboardSetStringWithFeedback(idTrxAcquirer);
        }}
        value={idTrxAcquirer}
      />
      <Divider />
      <ListItemInfoCopy
        label={I18n.t("idpay.initiative.operationDetails.transaction.issuerId")}
        onPress={() => {
          clipboardSetStringWithFeedback(idTrxIssuer);
        }}
        value={idTrxIssuer}
      />
    </View>
  );
};

export { IdPayTimelineTransactionDetailsComponent };
