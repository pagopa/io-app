import {
  IOIcons,
  ListItemSwitch,
  SwitchAction
} from "@pagopa/io-app-design-system";
import { default as React } from "react";
import {
  InstrumentDTO,
  InstrumentTypeEnum,
  StatusEnum
} from "../../../../../definitions/idpay/InstrumentDTO";
import I18n from "../../../../i18n";

type ValidInstrumentType =
  | InstrumentTypeEnum.IDPAYCODE
  | InstrumentTypeEnum.QRCODE;

export type PaymentMethodSwitchRef = {
  switchStatus: boolean;
  setSwitchStatus: (status: boolean) => void;
};

type PaymentMethodSwitchProps = {
  instrumentPaymentMethod: InstrumentDTO;
  onValueChange: (paymentType: InstrumentTypeEnum, value: boolean) => void;
  onPressAction?: (paymentType: InstrumentTypeEnum) => void;
};

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
  const { instrumentPaymentMethod, onPressAction, onValueChange } = props;

  const instrumentType =
    instrumentPaymentMethod.instrumentType as ValidInstrumentType;

  const renderSwitchAction = () => {
    if (instrumentType !== InstrumentTypeEnum.QRCODE) {
      return {
        label: I18n.t(
          `idpay.configuration.instruments.paymentMethods.${instrumentType}.actionItem`
        ),
        onPress: () => onPressAction?.(instrumentType)
      } as SwitchAction;
    }
    return undefined;
  };

  return (
    <ListItemSwitch
      disabled={instrumentType === InstrumentTypeEnum.QRCODE}
      value={instrumentPaymentMethod.status === StatusEnum.ACTIVE}
      action={renderSwitchAction()}
      icon={getInstrumentPaymentMethodIcon(instrumentType)}
      onSwitchValueChange={value => onValueChange(instrumentType, value)}
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
