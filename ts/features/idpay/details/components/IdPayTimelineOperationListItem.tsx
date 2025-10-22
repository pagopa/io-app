import {
  Icon,
  ListItemTransaction,
  ListItemTransactionLogo,
  WithTestID
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
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
import {
  getAccessibleAmountText,
  hoursAndMinutesToAccessibilityReadableFormat
} from "../../../../utils/accessibility";
import { getBadgePropsByTransactionStatus } from "../../../payments/common/utils";
import { formatAbsNumberAmountCentsOrDefault } from "../../common/utils/strings";

const emptyAmountTransaction = {
  amount: "",
  amountAccessibilityLabel: ""
};

export type TimelineOperationListItemProps = WithTestID<
  | {
      isLoading?: false;
      operation: OperationListDTO;
      pressable?: boolean;
      onPress?: () => void;
    }
  | { isLoading: true; operation?: never; onPress?: never; pressable?: never }
>;

export const IdPayTimelineOperationListItem = (
  props: TimelineOperationListItemProps
) => {
  const { isLoading, operation, pressable, onPress, testID } = props;

  if (isLoading) {
    return (
      <ListItemTransaction
        title=""
        subtitle=""
        transaction={{
          badge: { text: "", variant: "highlight" }
        }}
        isLoading={true}
      />
    );
  }

  const listItemProps = getOperationProps(operation);

  return (
    <ListItemTransaction
      {...listItemProps}
      onPress={pressable ? onPress : undefined}
      testID={testID}
    />
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
    amountCents,
    accruedCents
  } = operation;

  const isQRCode = channel === ChannelEnum.QRCODE;

  const iconName =
    channel === ChannelEnum.QRCODE || channel === ChannelEnum.BARCODE
      ? "merchant"
      : "creditCard";

  const isCancelled = status === TransactionStatusEnum.CANCELLED;
  const isReversal = operationType === TransactionOperationTypeEnum.REVERSAL;

  const paymentLogoIcon: ListItemTransactionLogo = brand || (
    <Icon name={iconName} color="grey-300" testID="genericLogoTestID" />
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
    amountCents,
    isReversal
  );

  const getAccruedString = () => {
    const signString = isReversal ? "" : "−";
    const accruedString = `${formatAbsNumberAmountCentsOrDefault(
      accruedCents
    )} €`;

    return `${signString}${accruedString}`;
  };

  if (isReversal) {
    return {
      paymentLogoIcon,
      title,
      subtitle,
      transaction: {
        badge: getBadgePropsByTransactionStatus("reversal")
      }
    };
  }

  if (isCancelled) {
    return {
      paymentLogoIcon,
      title,
      subtitle,
      transaction: {
        badge: getBadgePropsByTransactionStatus("cancelled")
      }
    };
  }

  return {
    paymentLogoIcon,
    title,
    subtitle,
    transaction: {
      amount: getAccruedString(),
      amountAccessibilityLabel:
        getAccessibleAmountText(getAccruedString()) ?? getAccruedString()
    }
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
      transaction: {
        badge: getBadgePropsByTransactionStatus("failure")
      }
    };
  }

  return {
    paymentLogoIcon: getLogo(),
    title: getTitle(),
    subtitle,
    transaction: emptyAmountTransaction
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
  transaction: emptyAmountTransaction
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
  transaction: emptyAmountTransaction
});

const getRefundOperationProps = (
  operation: RefundOperationDTO
): ListItemTransaction => {
  const { operationDate, operationType, amountCents } = operation;
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
      transaction: {
        badge: getBadgePropsByTransactionStatus("failure")
      }
    };
  }

  return {
    title,
    subtitle,
    paymentLogoIcon,
    transaction: {
      amount: `${formatAbsNumberAmountCentsOrDefault(amountCents)} €`,
      refund: true,
      amountAccessibilityLabel: `${getAccessibleAmountText(
        formatAbsNumberAmountCentsOrDefault(amountCents)
      )} €`
    }
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
  transaction: emptyAmountTransaction
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
  transaction: emptyAmountTransaction
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
  transaction: emptyAmountTransaction
});

export const getOperationSubtitle = (operationDate: Date): string => {
  const dateString = new Intl.DateTimeFormat("it", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(operationDate);
  const timeString =
    hoursAndMinutesToAccessibilityReadableFormat(operationDate);

  return `${dateString}, ${timeString}`;
};

export const getOperationSubtitleWithAmount = (
  operationDate: Date,
  amount: number | undefined,
  withMinusSign: boolean = false
): string => {
  const signString = withMinusSign ? "−" : "";
  const amountString = `${formatAbsNumberAmountCentsOrDefault(amount)} €`;

  return `${getOperationSubtitle(
    operationDate
  )} · ${signString}${amountString}`;
};
