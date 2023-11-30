import {
  Icon,
  ListItemTransaction,
  ListItemTransactionLogo,
  WithTestID
} from "@pagopa/io-app-design-system";
import React from "react";
import {
  IbanOperationDTO,
  OperationTypeEnum as IbanOperationTypeEnum
} from "../../../../../definitions/idpay/IbanOperationDTO";
import {
  OperationTypeEnum as UnsubscribeOperationTypeEnum,
  UnsubscribeOperationDTO
} from "../../../../../definitions/idpay/UnsubscribeOperationDTO";
import {
  InstrumentOperationDTO,
  OperationTypeEnum as InstrumentOperationTypeEnum,
  InstrumentTypeEnum
} from "../../../../../definitions/idpay/InstrumentOperationDTO";
import {
  OnboardingOperationDTO,
  OperationTypeEnum as OnboardingOperationTypeEnum
} from "../../../../../definitions/idpay/OnboardingOperationDTO";
import { OperationListDTO } from "../../../../../definitions/idpay/OperationListDTO";
import {
  ReadmittedOperationDTO,
  OperationTypeEnum as ReadmittedOperationTypeEnum
} from "../../../../../definitions/idpay/ReadmittedOperationDTO";
import {
  RefundOperationDTO,
  OperationTypeEnum as RefundOperationTypeEnum
} from "../../../../../definitions/idpay/RefundOperationDTO";
import {
  RejectedInstrumentOperationDTO,
  OperationTypeEnum as RejectedInstrumentOperationTypeEnum
} from "../../../../../definitions/idpay/RejectedInstrumentOperationDTO";
import {
  SuspendOperationDTO,
  OperationTypeEnum as SuspendOperationTypeEnum
} from "../../../../../definitions/idpay/SuspendOperationDTO";
import {
  ChannelEnum,
  TransactionOperationDTO,
  OperationTypeEnum as TransactionOperationTypeEnum,
  StatusEnum as TransactionStatusEnum
} from "../../../../../definitions/idpay/TransactionOperationDTO";
import I18n from "../../../../i18n";
import { hoursAndMinutesToAccessibilityReadableFormat } from "../../../../utils/accessibility";
import { localeDateFormat } from "../../../../utils/locale";
import { getBadgeTextByTransactionStatus } from "../../../walletV3/common/utils";
import { formatAbsNumberAmountOrDefault } from "../../common/utils/strings";

export type TimelineOperationListItemProps = WithTestID<
  | {
      isLoading?: false;
      operation: OperationListDTO;
      onPress?: () => void;
    }
  | { isLoading: true; operation?: never; onPress?: never }
>;

export const TimelineOperationListItem = (
  props: TimelineOperationListItemProps
) => {
  const { isLoading, operation, onPress, testID } = props;

  if (isLoading) {
    return (
      <ListItemTransaction
        title=""
        subtitle=""
        transactionStatus="pending"
        badgeText={""}
        isLoading={true}
      />
    );
  }

  const listItemProps = getOperationProps(operation);

  return (
    <ListItemTransaction {...listItemProps} onPress={onPress} testID={testID} />
  );
};

const getOperationProps = (operation: OperationListDTO) => {
  switch (operation.operationType) {
    case TransactionOperationTypeEnum.TRANSACTION:
    case TransactionOperationTypeEnum.REVERSAL:
      return getTransactionOperationProps(operation);
    case InstrumentOperationTypeEnum.ADD_INSTRUMENT:
    case InstrumentOperationTypeEnum.DELETE_INSTRUMENT:
    case RejectedInstrumentOperationTypeEnum.REJECTED_ADD_INSTRUMENT:
    case RejectedInstrumentOperationTypeEnum.REJECTED_DELETE_INSTRUMENT:
      return getInstrumentOperationProps(operation);
    case IbanOperationTypeEnum.ADD_IBAN:
      return getIbanOperationProps(operation);
    case OnboardingOperationTypeEnum.ONBOARDING:
      return getOnboardingOperationProps(operation);
    case RefundOperationTypeEnum.PAID_REFUND:
    case RefundOperationTypeEnum.REJECTED_REFUND:
      return getRefundOperationProps(operation);
    case SuspendOperationTypeEnum.SUSPENDED:
      return getSuspendOperationProps(operation);
    case ReadmittedOperationTypeEnum.READMITTED:
      return getReadmittedOperationProps(operation);
    case UnsubscribeOperationTypeEnum.UNSUBSCRIBED:
      return getUnsubscribedOperationProps(operation);
  }
};

const getTransactionOperationProps = (
  operation: TransactionOperationDTO
): ListItemTransaction => {
  const {
    operationType,
    operationDate,
    channel,
    businessName,
    brand,
    status,
    amount,
    accrued
  } = operation;

  const isQRCode = channel === ChannelEnum.QRCODE;

  // CANCELLED operations must be considered as REVERSAL (see IOBP-391)
  const isReversal =
    status === TransactionStatusEnum.CANCELLED ||
    operationType === TransactionOperationTypeEnum.REVERSAL;

  const paymentLogoIcon: ListItemTransactionLogo = brand || (
    <Icon
      name={isQRCode ? "merchant" : "creditCard"}
      color="grey-300"
      testID="genericLogoTestID"
    />
  );

  const title: string =
    businessName ||
    I18n.t(
      `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.${
        isQRCode ? "TRANSACTION_ONLINE" : "TRANSACTION"
      }`
    );

  const subtitle = getOperationSubtitleWithAmount(
    operationDate,
    amount,
    isReversal
  );

  const getAccruedString = () => {
    const signString = isReversal ? "" : "-";
    const accruedString = `${formatAbsNumberAmountOrDefault(accrued)} €`;

    return `${signString}${accruedString}`;
  };

  if (isReversal) {
    return {
      paymentLogoIcon,
      title,
      subtitle,
      transactionStatus: "reversal",
      badgeText: getBadgeTextByTransactionStatus("reversal")
    };
  }

  return {
    paymentLogoIcon,
    title,
    subtitle,
    transactionStatus: "success",
    transactionAmount: getAccruedString()
  };
};

const getInstrumentOperationProps = (
  operation: InstrumentOperationDTO | RejectedInstrumentOperationDTO
): ListItemTransaction => {
  const { operationDate, operationType, maskedPan, instrumentType, brand } =
    operation;

  const isRejected =
    operationType ===
      RejectedInstrumentOperationTypeEnum.REJECTED_ADD_INSTRUMENT ||
    operationType ===
      RejectedInstrumentOperationTypeEnum.REJECTED_DELETE_INSTRUMENT;

  const getTitle = () => {
    if (instrumentType === InstrumentTypeEnum.IDPAYCODE) {
      return I18n.t(
        `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.CIE`
      );
    }

    return I18n.t(
      `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.${operationType}`,
      {
        maskedPan: maskedPan !== undefined ? `···· ${maskedPan}` : ""
      }
    );
  };

  const subtitle = getOperationSubtitle(operationDate);

  const getLogo = () => {
    if (instrumentType === InstrumentTypeEnum.IDPAYCODE) {
      return (
        <Icon
          name={"fiscalCodeIndividual"}
          color="grey-300"
          testID="fiscalCodeLogoTestID"
        />
      );
    }
    return (
      brand || (
        <Icon
          name={"creditCard"}
          color="grey-300"
          testID="creditCardLogoTestID"
        />
      )
    );
  };

  if (isRejected) {
    return {
      paymentLogoIcon: getLogo(),
      title: getTitle(),
      subtitle,
      transactionStatus: "failure",
      badgeText: getBadgeTextByTransactionStatus("failure")
    };
  }

  return {
    paymentLogoIcon: getLogo(),
    title: getTitle(),
    subtitle,
    transactionStatus: "success",
    transactionAmount: ""
  };
};

const getIbanOperationProps = (
  operation: IbanOperationDTO
): ListItemTransaction => ({
  paymentLogoIcon: (
    <Icon name={"institution"} color="grey-300" testID="ibanLogoTestID" />
  ),
  title: I18n.t(
    `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.ADD_IBAN`
  ),
  subtitle: getOperationSubtitle(operation.operationDate),
  transactionStatus: "success",
  transactionAmount: ""
});

const getOnboardingOperationProps = (
  operation: OnboardingOperationDTO
): ListItemTransaction => ({
  paymentLogoIcon: (
    <Icon name={"checkTick"} color="grey-300" testID="onboardingLogoTestID" />
  ),
  title: I18n.t(
    `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.ONBOARDING`
  ),
  subtitle: getOperationSubtitle(operation.operationDate),
  transactionStatus: "success",
  transactionAmount: ""
});

const getRefundOperationProps = (
  operation: RefundOperationDTO
): ListItemTransaction => {
  const { operationDate, operationType, amount } = operation;
  const isRejected = operationType === RefundOperationTypeEnum.REJECTED_REFUND;

  const paymentLogoIcon = (
    <Icon name={"refund"} color="grey-300" testID="refundLogoTestID" />
  );
  const title = I18n.t(
    `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.REFUND`
  );
  const subtitle = getOperationSubtitle(operationDate);

  if (isRejected) {
    return {
      title,
      subtitle,
      paymentLogoIcon,
      transactionStatus: "failure",
      badgeText: getBadgeTextByTransactionStatus("failure")
    };
  }

  return {
    title,
    subtitle,
    paymentLogoIcon,
    transactionStatus: "success",
    transactionAmount: `${formatAbsNumberAmountOrDefault(amount)} €`
  };
};

const getSuspendOperationProps = (
  operation: SuspendOperationDTO
): ListItemTransaction => ({
  paymentLogoIcon: (
    <Icon name={"notice"} color="grey-300" testID="creditCardLogoTestID" />
  ),
  title: I18n.t(
    `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.SUSPENDED`
  ),
  subtitle: getOperationSubtitle(operation.operationDate),
  transactionStatus: "success",
  transactionAmount: ""
});

const getReadmittedOperationProps = (
  operation: ReadmittedOperationDTO
): ListItemTransaction => ({
  paymentLogoIcon: (
    <Icon
      name={"checkTickBig"}
      color="grey-300"
      testID="creditCardLogoTestID"
    />
  ),
  title: I18n.t(
    `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.READMITTED`
  ),
  subtitle: getOperationSubtitle(operation.operationDate),
  transactionStatus: "success",
  transactionAmount: ""
});
const getUnsubscribedOperationProps = (
  operation: UnsubscribeOperationDTO
): ListItemTransaction => ({
  paymentLogoIcon: (
    <Icon name={"logout"} color="grey-300" testID="creditCardLogoTestID" />
  ),
  title: I18n.t(
    `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.UNSUBSCRIBED`
  ),
  subtitle: getOperationSubtitle(operation.operationDate),
  transactionStatus: "success",
  transactionAmount: ""
});

export const getOperationSubtitle = (operationDate: Date): string => {
  const dateString = localeDateFormat(
    operationDate,
    I18n.t("global.dateFormats.fullFormatShortMonthLiteral")
  );
  const timeString =
    hoursAndMinutesToAccessibilityReadableFormat(operationDate);

  return `${dateString}, ${timeString}`;
};

export const getOperationSubtitleWithAmount = (
  operationDate: Date,
  amount: number | undefined,
  withMinusSign: boolean = false
): string => {
  const signString = withMinusSign ? "-" : "";
  const amountString = `${formatAbsNumberAmountOrDefault(amount)} €`;

  return `${getOperationSubtitle(
    operationDate
  )} · ${signString}${amountString}`;
};
