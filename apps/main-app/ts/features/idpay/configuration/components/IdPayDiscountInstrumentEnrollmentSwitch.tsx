import {
  InstrumentTypeEnum,
  StatusEnum
} from "@io-app/api-types/generated/definitions/idpay/InstrumentDTO";
import {
  Badge,
  IOIcons,
  ListItemSwitch,
  SwitchAction
} from "@io-app/design-system";
import I18n from "i18next";

type PaymentMethodSwitchProps = (
  | {
      instrumentType: InstrumentTypeEnum.APP_IO_PAYMENT;
      onValueChange?: never;
      value?: never;
    }
  | {
      instrumentType: ValidInstrumentType;
      onValueChange: (value: boolean) => void;
      value: boolean;
    }
) & {
  isLoading?: boolean;
  onPressAction?: () => void;
  status?: StatusEnum;
};

type ValidInstrumentType =
  | InstrumentTypeEnum.APP_IO_PAYMENT
  | InstrumentTypeEnum.IDPAYCODE;

const getInstrumentPaymentMethodIcon = (
  paymentType: InstrumentTypeEnum
): IOIcons => {
  switch (paymentType) {
    case InstrumentTypeEnum.IDPAYCODE:
      return "fiscalCodeIndividual";
    case InstrumentTypeEnum.APP_IO_PAYMENT:
    default:
      return "device";
  }
};

const getInstrumentPaymentMethodBage = (
  instrumentType: InstrumentTypeEnum,
  status?: StatusEnum
) => {
  if (instrumentType === InstrumentTypeEnum.APP_IO_PAYMENT) {
    return {
      text: I18n.t(
        `idpay.configuration.instruments.paymentMethods.badge.active`
      ),
      variant: "highlight"
    } as Badge;
  }
  switch (status) {
    case StatusEnum.PENDING_DEACTIVATION_REQUEST:
    case StatusEnum.PENDING_ENROLLMENT_REQUEST:
      return {
        text: I18n.t(
          `idpay.configuration.instruments.paymentMethods.badge.pending`
        ),
        variant: "warning"
      } as Badge;
    default:
      return undefined;
  }
};

const getInstrumentPaymentMethodCopy = (
  instrumentType: ValidInstrumentType
): { description: string; title: string } => {
  switch (instrumentType) {
    case InstrumentTypeEnum.APP_IO_PAYMENT:
      return {
        title: I18n.t(
          "idpay.configuration.instruments.paymentMethods.APP_IO_PAYMENT.title"
        ),
        description: I18n.t(
          "idpay.configuration.instruments.paymentMethods.APP_IO_PAYMENT.description"
        )
      };
    case InstrumentTypeEnum.IDPAYCODE:
      return {
        title: I18n.t(
          "idpay.configuration.instruments.paymentMethods.IDPAYCODE.title"
        ),
        description: I18n.t(
          "idpay.configuration.instruments.paymentMethods.IDPAYCODE.description"
        )
      };
  }
};

/**
 * A component to enable/disable the payment method of an instrument into discount initiative configuration
 */
const IdPayDiscountInstrumentEnrollmentSwitch = (
  props: PaymentMethodSwitchProps
) => {
  const {
    instrumentType,
    value,
    isLoading,
    status,
    onPressAction,
    onValueChange
  } = props;

  const { title, description } = getInstrumentPaymentMethodCopy(instrumentType);

  const renderSwitchAction = () => {
    if (instrumentType === InstrumentTypeEnum.IDPAYCODE) {
      return {
        label: I18n.t(
          "idpay.configuration.instruments.paymentMethods.IDPAYCODE.actionItem"
        ),
        onPress: onPressAction
      } as SwitchAction;
    }
    return undefined;
  };

  return (
    <ListItemSwitch
      action={renderSwitchAction()}
      badge={getInstrumentPaymentMethodBage(instrumentType, status)}
      description={description}
      icon={getInstrumentPaymentMethodIcon(instrumentType)}
      isLoading={isLoading}
      label={title}
      onSwitchValueChange={value => onValueChange?.(value)}
      value={value}
    />
  );
};

export { IdPayDiscountInstrumentEnrollmentSwitch };
