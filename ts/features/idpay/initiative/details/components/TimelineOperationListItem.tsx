import { format } from "date-fns";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { OperationTypeEnum as IbanOperationTypeEnum } from "../../../../../../definitions/idpay/IbanOperationDTO";
import { OperationTypeEnum as InstrumentOperationTypeEnum } from "../../../../../../definitions/idpay/InstrumentOperationDTO";
import { OperationTypeEnum as OnboardingOperationTypeEnum } from "../../../../../../definitions/idpay/OnboardingOperationDTO";
import { OperationListDTO } from "../../../../../../definitions/idpay/OperationListDTO";
import { OperationTypeEnum as RefundOperationTypeEnum } from "../../../../../../definitions/idpay/RefundOperationDTO";
import { OperationTypeEnum as RejectedInstrumentOperationTypeEnum } from "../../../../../../definitions/idpay/RejectedInstrumentOperationDTO";
import {
  ChannelEnum,
  TransactionOperationDTO,
  OperationTypeEnum as TransactionOperationTypeEnum,
  StatusEnum as TransactionStatusEnum
} from "../../../../../../definitions/idpay/TransactionOperationDTO";
import { Icon } from "../../../../../components/core/icons";
import I18n from "../../../../../i18n";
import { formatNumberAmount } from "../../../../../utils/stringBuilder";
import {
  ListItemTransaction,
  ListItemTransactionStatus
} from "../../../../../components/ui/ListItemTransaction";
import { localeDateFormat } from "../../../../../utils/locale";

const getHourAndMinuteFromDate = (date: Date) => format(date, "HH:mm");

const formatAbsNumberAmountOrDefault = (amount: number | undefined) =>
  pipe(
    amount,
    O.fromNullable,
    O.map(Math.abs),
    O.map(formatNumberAmount),
    O.getOrElse(() => "-")
  );

type TimelineOperationListItemProps = {
  operation: OperationListDTO;
  onPress?: () => void;
};

const getPaymentLogoIcon = (operation: OperationListDTO) => {
  switch (operation.operationType) {
    case OnboardingOperationTypeEnum.ONBOARDING:
      return <Icon name={"ok"} />;
    case IbanOperationTypeEnum.ADD_IBAN:
      return <Icon name={"institution"} color="bluegreyLight" />;
    case RefundOperationTypeEnum.PAID_REFUND:
      return <Icon name="refund" color="bluegrey" />;
    case RejectedInstrumentOperationTypeEnum.REJECTED_ADD_INSTRUMENT:
    case RejectedInstrumentOperationTypeEnum.REJECTED_DELETE_INSTRUMENT:
    case RefundOperationTypeEnum.REJECTED_REFUND:
      return <Icon name={"notice"} color="red" />;
    case TransactionOperationTypeEnum.REVERSAL:
    case TransactionOperationTypeEnum.TRANSACTION:
      if (operation.channel === ChannelEnum.QRCODE) {
        return <Icon name={"productIOAppBlueBg"} color="bluegreyLight" />;
      }
      return operation.brand;
    case InstrumentOperationTypeEnum.ADD_INSTRUMENT:
    case InstrumentOperationTypeEnum.DELETE_INSTRUMENT:
      return operation.brand;
    default:
      return "amex";
  }
};

const getDiscountInitiativeTransactionStatus = (
  operation: TransactionOperationDTO
): ListItemTransactionStatus => {
  switch (operation.status) {
    case TransactionStatusEnum.CANCELLED:
      return "cancelled";
    case TransactionStatusEnum.REWARDED:
    case TransactionStatusEnum.AUTHORIZED:
      return "success";
  }
};

const getTransactionAmountLabel = (operation: OperationListDTO) => {
  switch (operation.operationType) {
    case TransactionOperationTypeEnum.TRANSACTION:
      return `-${formatAbsNumberAmountOrDefault(operation.accrued)} €`;
    case TransactionOperationTypeEnum.REVERSAL:
      return `+${formatAbsNumberAmountOrDefault(operation.accrued)} €`;
    case RefundOperationTypeEnum.PAID_REFUND:
      return `${formatAbsNumberAmountOrDefault(operation.amount)} €`;
    default:
      return "";
  }
};

const TimelineOperationListItem = (props: TimelineOperationListItemProps) => {
  const { operation, onPress } = props;

  const getOperationTitle = () => {
    switch (operation.operationType) {
      case TransactionOperationTypeEnum.TRANSACTION:
        if (operation.channel === ChannelEnum.QRCODE) {
          if (operation.businessName) {
            return operation.businessName;
          }
          return I18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.QRCODE_TRANSACTION"
          );
        }
        return I18n.t(
          `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.TRANSACTION`
        );
      default:
        return I18n.t(
          `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.${operation.operationType}`
        );
    }
  };

  const getOperationAmount = () => {
    switch (operation.operationType) {
      case TransactionOperationTypeEnum.TRANSACTION:
        return ` · € ${formatAbsNumberAmountOrDefault(operation.amount)}`;
      case TransactionOperationTypeEnum.REVERSAL:
        return ` · € -${formatAbsNumberAmountOrDefault(operation.amount)}`;
      default:
        return "";
    }
  };

  const getOperationStatus = (): ListItemTransactionStatus => {
    switch (operation.operationType) {
      case TransactionOperationTypeEnum.TRANSACTION:
        if (operation.channel === ChannelEnum.QRCODE) {
          return getDiscountInitiativeTransactionStatus(operation);
        }
        return "success";
      case TransactionOperationTypeEnum.REVERSAL:
        return "success";
      case RefundOperationTypeEnum.PAID_REFUND:
        return "refunded";
      default:
        return "success";
    }
  };
  return (
    <ListItemTransaction
      title={getOperationTitle()}
      subtitle={`${localeDateFormat(
        operation.operationDate,
        I18n.t("global.dateFormats.fullFormatShortMonthLiteral")
      )}, ${getHourAndMinuteFromDate(
        operation.operationDate
      )}${getOperationAmount()}`}
      paymentLogoIcon={getPaymentLogoIcon(operation)}
      transactionStatus={getOperationStatus()}
      transactionAmount={getTransactionAmountLabel(operation)}
      onPress={onPress}
    />
  );
};

const TimelineOperationListItemSkeleton = () => (
  <ListItemTransaction
    subtitle="..."
    title="..."
    transactionStatus="pending"
    isLoading
  />
);

export { TimelineOperationListItem, TimelineOperationListItemSkeleton };
