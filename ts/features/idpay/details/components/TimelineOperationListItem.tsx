import {
  Icon,
  ListItemTransaction,
  ListItemTransactionLogo
} from "@pagopa/io-app-design-system";
import React from "react";
import {
  IbanOperationDTO,
  OperationTypeEnum as IbanOperationTypeEnum
} from "../../../../../definitions/idpay/IbanOperationDTO";
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

export type TimelineOperationListItemProps = {
  operation: OperationListDTO;
  onPress?: () => void;
};

export const TimelineOperationListItem = (
  props: TimelineOperationListItemProps
) => {
  const { operation, onPress } = props;

  switch (operation.operationType) {
    case TransactionOperationTypeEnum.TRANSACTION:
    case TransactionOperationTypeEnum.REVERSAL:
      return (
        <TransactionOperationListItem operation={operation} onPress={onPress} />
      );
    case InstrumentOperationTypeEnum.ADD_INSTRUMENT:
    case InstrumentOperationTypeEnum.DELETE_INSTRUMENT:
    case RejectedInstrumentOperationTypeEnum.REJECTED_ADD_INSTRUMENT:
    case RejectedInstrumentOperationTypeEnum.REJECTED_DELETE_INSTRUMENT:
      return (
        <InstrumentOperationListItem operation={operation} onPress={onPress} />
      );
    case IbanOperationTypeEnum.ADD_IBAN:
      return <IbanOperationListItem operation={operation} />;
    case OnboardingOperationTypeEnum.ONBOARDING:
      return <OnboardingOperationListItem operation={operation} />;
    case RefundOperationTypeEnum.PAID_REFUND:
    case RefundOperationTypeEnum.REJECTED_REFUND:
      return (
        <RefundOperationListItem operation={operation} onPress={onPress} />
      );
    case SuspendOperationTypeEnum.SUSPENDED:
      return <SuspendOperationListItem operation={operation} />;
    case ReadmittedOperationTypeEnum.READMITTED:
      return <ReadmittedOperationListItem operation={operation} />;
  }
};

export const TimelineOperationListItemSkeleton = () => (
  <ListItemTransaction
    title=""
    subtitle=""
    transactionStatus="pending"
    badgeText={""}
    isLoading={true}
  />
);

type ListItemProps<T extends OperationListDTO> = {
  operation: T;
  onPress?: () => void;
};

const TransactionOperationListItem = (
  props: ListItemProps<TransactionOperationDTO>
) => {
  const {
    operationType,
    operationDate,
    channel,
    businessName,
    brand,
    status,
    amount,
    accrued
  } = props.operation;

  const isQRCode = channel === ChannelEnum.QRCODE;

  // CANCELLED operations must be considered as REVERSAL (see IOBP-391)
  const isReversal =
    status === TransactionStatusEnum.CANCELLED ||
    operationType === TransactionOperationTypeEnum.REVERSAL;

  const logo: ListItemTransactionLogo = brand || (
    <Icon name={isQRCode ? "merchant" : "creditCard"} color="grey-300" />
  );

  const title: string =
    businessName ||
    I18n.t(
      `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.${
        isQRCode ? "QRCODE_TRANSACTION" : "TRANSACTION"
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
    return (
      <ListItemTransaction
        paymentLogoIcon={logo}
        title={title}
        subtitle={subtitle}
        transactionStatus={"reversal"}
        badgeText={getBadgeTextByTransactionStatus("reversal")}
        onPress={props.onPress}
      />
    );
  }

  return (
    <ListItemTransaction
      paymentLogoIcon={logo}
      title={title}
      subtitle={subtitle}
      transactionStatus={"success"}
      transactionAmount={getAccruedString()}
      onPress={props.onPress}
    />
  );
};

const InstrumentOperationListItem = (
  props: ListItemProps<InstrumentOperationDTO | RejectedInstrumentOperationDTO>
) => {
  const { operationDate, operationType, maskedPan, instrumentType, brand } =
    props.operation;

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
      return <Icon name={"creditCard"} color="grey-300" />;
    }
    return brand || <Icon name={"creditCard"} color="grey-300" />;
  };

  if (isRejected) {
    return (
      <ListItemTransaction
        paymentLogoIcon={getLogo()}
        title={getTitle()}
        subtitle={subtitle}
        transactionStatus="failure"
        badgeText={getBadgeTextByTransactionStatus("failure")}
      />
    );
  }

  return (
    <ListItemTransaction
      paymentLogoIcon={getLogo()}
      title={getTitle()}
      subtitle={subtitle}
      transactionStatus="success"
      transactionAmount=""
    />
  );
};

const IbanOperationListItem = (props: ListItemProps<IbanOperationDTO>) => (
  <ListItemTransaction
    paymentLogoIcon={<Icon name={"institution"} color="grey-300" />}
    title={I18n.t(
      `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.ADD_IBAN`
    )}
    subtitle={getOperationSubtitle(props.operation.operationDate)}
    transactionStatus={"success"}
    transactionAmount=""
    onPress={props.onPress}
  />
);

const OnboardingOperationListItem = (
  props: ListItemProps<OnboardingOperationDTO>
) => (
  <ListItemTransaction
    title={I18n.t(
      `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.ONBOARDING`
    )}
    subtitle={getOperationSubtitle(props.operation.operationDate)}
    paymentLogoIcon={<Icon name={"checkTick"} color="grey-300" />}
    transactionStatus={"success"}
    transactionAmount={""}
  />
);

const RefundOperationListItem = (props: ListItemProps<RefundOperationDTO>) => {
  const { operationDate, operationType, amount } = props.operation;
  const isRejected = operationType === RefundOperationTypeEnum.REJECTED_REFUND;

  const operationLogo = <Icon name={"refund"} color="grey-300" />;
  const title = I18n.t(
    `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.${operationType}`
  );
  const subtitle = getOperationSubtitle(operationDate);

  if (isRejected) {
    return (
      <ListItemTransaction
        title={title}
        subtitle={subtitle}
        paymentLogoIcon={operationLogo}
        transactionStatus={"failure"}
        badgeText={getBadgeTextByTransactionStatus("failure")}
        onPress={props.onPress}
      />
    );
  }

  return (
    <ListItemTransaction
      title={title}
      subtitle={subtitle}
      paymentLogoIcon={operationLogo}
      transactionStatus={"success"}
      transactionAmount={`${formatAbsNumberAmountOrDefault(amount)} €`}
      onPress={props.onPress}
    />
  );
};

const SuspendOperationListItem = (
  props: ListItemProps<SuspendOperationDTO>
) => (
  <ListItemTransaction
    title={I18n.t(
      `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.SUSPENDED`
    )}
    subtitle={getOperationSubtitle(props.operation.operationDate)}
    transactionStatus={"success"}
    transactionAmount={""}
  />
);

const ReadmittedOperationListItem = (
  props: ListItemProps<ReadmittedOperationDTO>
) => (
  <ListItemTransaction
    title={I18n.t(
      `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.READMITTED`
    )}
    subtitle={getOperationSubtitle(props.operation.operationDate)}
    transactionStatus={"success"}
    transactionAmount={""}
  />
);

const getOperationSubtitle = (operationDate: Date): string => {
  const dateString = localeDateFormat(
    operationDate,
    I18n.t("global.dateFormats.fullFormatShortMonthLiteral")
  );
  const timeString =
    hoursAndMinutesToAccessibilityReadableFormat(operationDate);

  return `${dateString}, ${timeString}`;
};

const getOperationSubtitleWithAmount = (
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
