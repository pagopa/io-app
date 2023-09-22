import {
  IOIcons,
  ListItemSwitch,
  SwitchAction
} from "@pagopa/io-app-design-system";
import { default as React } from "react";
import { InstrumentTypeEnum } from "../../../../../definitions/idpay/InstrumentDTO";
import I18n from "../../../../i18n";

type ValidInstrumentType =
  | InstrumentTypeEnum.IDPAYCODE
  | InstrumentTypeEnum.QRCODE;

export type PaymentMethodSwitchRef = {
  switchStatus: boolean;
  setSwitchStatus: (status: boolean) => void;
};

type PaymentMethodSwitchProps = {
  onPressAction?: () => void;
} & (
  | {
      instrumentType: InstrumentTypeEnum.QRCODE;
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
    case InstrumentTypeEnum.QRCODE:
      return "device";
    case InstrumentTypeEnum.IDPAYCODE:
      return "fiscalCodeIndividual";
    default:
      return "device";
  }
};

/**
 * A component to enable/disable the payment method of an instrument into discount initiative configuration
 */
const IdPayDiscountInstrumentEnrollmentSwitch = (
  props: PaymentMethodSwitchProps
) => {
  const { instrumentType, value, onPressAction, onValueChange } = props;

  const renderSwitchAction = () => {
    if (instrumentType !== InstrumentTypeEnum.QRCODE) {
      return {
        label: I18n.t(
          `idpay.configuration.instruments.paymentMethods.${instrumentType}.actionItem`
        ),
        onPress: () => onPressAction?.()
      } as SwitchAction;
    }
    return undefined;
  };

  return (
    <ListItemSwitch
      value={value}
      action={renderSwitchAction()}
      icon={getInstrumentPaymentMethodIcon(instrumentType)}
      onSwitchValueChange={value => onValueChange?.(value)}
      label={I18n.t(
        `idpay.configuration.instruments.paymentMethods.${instrumentType}.title`
      )}
      description={I18n.t(
        `idpay.configuration.instruments.paymentMethods.${instrumentType}.description`
      )}
    />
  );
};

export { IdPayDiscountInstrumentEnrollmentSwitch };
