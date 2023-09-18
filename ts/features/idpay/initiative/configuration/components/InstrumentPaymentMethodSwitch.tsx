import {
  IOIcons,
  ListItemSwitch,
  SwitchAction
} from "@pagopa/io-app-design-system";
import { default as React } from "react";
import {
  InstrumentDTO,
  StatusEnum
} from "../../../../../../definitions/idpay/InstrumentDTO";
import { IDPayConfigurationPaymentMethods } from "../types";
import I18n from "../../../../../i18n";

export type PaymentMethodSwitchRef = {
  switchStatus: boolean;
  setSwitchStatus: (status: boolean) => void;
};

type PaymentMethodSwitchProps = {
  instrumentPaymentMethod: InstrumentDTO;
  onValueChange: (
    paymentType: IDPayConfigurationPaymentMethods,
    value: boolean
  ) => void;
  onPressAction?: (paymentType: IDPayConfigurationPaymentMethods) => void;
};

const getInstrumentPaymentMethodIcon = (
  paymentType: IDPayConfigurationPaymentMethods
): IOIcons => {
  switch (paymentType) {
    case IDPayConfigurationPaymentMethods.APP_IO:
      return "device";
    case IDPayConfigurationPaymentMethods.CIE:
      return "fiscalCodeIndividual";
  }
};

const getPaymentTypeFromInstrument = (
  instrumentPaymentMethod: InstrumentDTO
) => {
  switch (instrumentPaymentMethod.brand) {
    case "io":
      return IDPayConfigurationPaymentMethods.APP_IO;
    case "cie":
      return IDPayConfigurationPaymentMethods.CIE;
    default:
      return IDPayConfigurationPaymentMethods.CIE;
  }
};

/**
 * A component to enable/disable the payment method of an instrument into discount initiative configuration
 */
const InstrumentPaymentMethodSwitch = (props: PaymentMethodSwitchProps) => {
  const { instrumentPaymentMethod, onPressAction, onValueChange } = props;

  const paymentType = getPaymentTypeFromInstrument(instrumentPaymentMethod);

  const renderSwitchAction = () => {
    if (paymentType !== IDPayConfigurationPaymentMethods.APP_IO) {
      return {
        label: I18n.t(
          `idpay.configuration.instruments.paymentMethods.${paymentType}.actionItem`
        ),
        onPress: () => onPressAction?.(paymentType)
      } as SwitchAction;
    }
    return undefined;
  };

  return (
    <ListItemSwitch
      disabled={paymentType === IDPayConfigurationPaymentMethods.APP_IO}
      value={instrumentPaymentMethod.status === StatusEnum.ACTIVE}
      action={renderSwitchAction()}
      icon={getInstrumentPaymentMethodIcon(paymentType)}
      onSwitchValueChange={value => onValueChange(paymentType, value)}
      label={I18n.t(
        `idpay.configuration.instruments.paymentMethods.${paymentType}.title`
      )}
      description={I18n.t(
        `idpay.configuration.instruments.paymentMethods.${paymentType}.description`
      )}
    />
  );
};

export { InstrumentPaymentMethodSwitch };
