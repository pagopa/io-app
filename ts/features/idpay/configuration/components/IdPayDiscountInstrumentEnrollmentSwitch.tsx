import {
  IOIcons,
  ListItemSwitch,
  SwitchAction
} from "@pagopa/io-app-design-system";
import { default as React } from "react";
import {
  InstrumentDTO,
  StatusEnum
} from "../../../../../definitions/idpay/InstrumentDTO";
import { IDPayDiscountInitiativeInstruments } from "../types";
import I18n from "../../../../i18n";

export type PaymentMethodSwitchRef = {
  switchStatus: boolean;
  setSwitchStatus: (status: boolean) => void;
};

type PaymentMethodSwitchProps = {
  instrumentPaymentMethod: InstrumentDTO;
  onValueChange: (
    paymentType: IDPayDiscountInitiativeInstruments,
    value: boolean
  ) => void;
  onPressAction?: (paymentType: IDPayDiscountInitiativeInstruments) => void;
};

const getInstrumentPaymentMethodIcon = (
  paymentType: IDPayDiscountInitiativeInstruments
): IOIcons => {
  switch (paymentType) {
    case IDPayDiscountInitiativeInstruments.APP_IO:
      return "device";
    case IDPayDiscountInitiativeInstruments.CIE:
      return "fiscalCodeIndividual";
  }
};

const getPaymentTypeFromInstrument = (
  instrumentPaymentMethod: InstrumentDTO
) => {
  switch (instrumentPaymentMethod.brand) {
    case "io":
      return IDPayDiscountInitiativeInstruments.APP_IO;
    case "cie":
      return IDPayDiscountInitiativeInstruments.CIE;
    default:
      return IDPayDiscountInitiativeInstruments.CIE;
  }
};

/**
 * A component to enable/disable the payment method of an instrument into discount initiative configuration
 */
const IdPayDiscountInstrumentEnrollmentSwitch = (
  props: PaymentMethodSwitchProps
) => {
  const { instrumentPaymentMethod, onPressAction, onValueChange } = props;

  const paymentType = getPaymentTypeFromInstrument(instrumentPaymentMethod);

  const renderSwitchAction = () => {
    if (paymentType !== IDPayDiscountInitiativeInstruments.APP_IO) {
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
      disabled={paymentType === IDPayDiscountInitiativeInstruments.APP_IO}
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

export { IdPayDiscountInstrumentEnrollmentSwitch };
