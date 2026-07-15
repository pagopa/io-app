import {
  Alert,
  Divider,
  IOLogoPaymentType,
  ListItemHeader,
  ListItemInfo,
  ListItemInfoCopy,
  VSpacer
} from "@io-app/design-system";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { View } from "react-native";

import {
  TransactionDetailDTO,
  OperationTypeEnum as TransactionTypeEnum
} from "../../../../../definitions/idpay/TransactionDetailDTO";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { format } from "../../../../utils/dates";
import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";
import { getLabelForCircuitType } from "../../common/labels";

type Props = {
  transaction: TransactionDetailDTO;
};

const IdPayTimelineTransactionDetailsComponent = (props: Props) => {
  const { transaction } = props;

  const reversalAlertComponent = pipe(
    transaction.operationType,
    O.of,
    O.filter(type => type === TransactionTypeEnum.REVERSAL),
    O.map(() => (
      <>
        <Alert
          content={I18n.t(
            "idpay.initiative.operationDetails.transaction.reversalAdvice"
          )}
          variant="info"
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
