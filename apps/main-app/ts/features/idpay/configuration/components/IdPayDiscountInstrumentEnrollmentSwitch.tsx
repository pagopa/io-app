import {
  Badge,
  IOIcons,
  ListItemSwitch,
  SwitchAction
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import {
  InstrumentTypeEnum,
  StatusEnum
} from "../../../../../definitions/idpay/InstrumentDTO";

type ValidInstrumentType =
  | InstrumentTypeEnum.IDPAYCODE
  | InstrumentTypeEnum.APP_IO_PAYMENT;

type PaymentMethodSwitchProps = {
  onPressAction?: () => void;
  isLoading?: boolean;
  status?: StatusEnum;
} & (
  | {
      instrumentType: InstrumentTypeEnum.APP_IO_PAYMENT;
      value?: never;
      onValueChange?: never;
    }
  | {
      instrumentType: ValidInstrumentType;
      value: boolean;
      onValueChange: (value: boolean) => void;
    }
);

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

  const renderSwitchAction = () => {
    if (instrumentType !== InstrumentTypeEnum.APP_IO_PAYMENT) {
      return {
        label: I18n.t(
          `idpay.configuration.instruments.paymentMethods.${instrumentType}.actionItem`
        ),
        onPress: onPressAction
      } as SwitchAction;
    }
    return undefined;
  };

  return (
    <ListItemSwitch
      value={value}
      isLoading={isLoading}
      action={renderSwitchAction()}
      icon={getInstrumentPaymentMethodIcon(instrumentType)}
      onSwitchValueChange={value => onValueChange?.(value)}
      label={I18n.t(
        `idpay.configuration.instruments.paymentMethods.${instrumentType}.title`
      )}
      badge={getInstrumentPaymentMethodBage(instrumentType, status)}
      description={I18n.t(
        `idpay.configuration.instruments.paymentMethods.${instrumentType}.description`
      )}
    />
  );
};

export { IdPayDiscountInstrumentEnrollmentSwitch };
