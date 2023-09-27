import {
  Badge,
  IOIcons,
  IOLogoPaymentType,
  ListItemSwitch
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useSelector } from "@xstate/react";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { default as React } from "react";
import { StatusEnum as InstrumentStatusEnum } from "../../../../../definitions/idpay/InstrumentDTO";
import { CreditCardType, Wallet } from "../../../../types/pagopa";
import { instrumentStatusLabels } from "../../common/labels";
import { useConfigurationMachineService } from "../xstate/provider";
import { instrumentStatusByIdWalletSelector } from "../xstate/selectors";

/**
 * See @ListItemSwitch
 */
type ListItemSwitchIconProps =
  | { icon?: never; paymentLogo: IOLogoPaymentType }
  | { icon: IOIcons; paymentLogo?: never }
  | { icon?: never; paymentLogo?: never };

export type InstrumentEnrollmentSwitchRef = {
  switchStatus: boolean;
  setSwitchStatus: (status: boolean) => void;
};

type InstrumentEnrollmentSwitchProps = {
  wallet: Wallet;
  isStaged: boolean;
  onValueChange: (value: boolean) => void;
};

/**
 * A component to enable/disable the enrollment of an instrument
 */
const InstrumentEnrollmentSwitch = (props: InstrumentEnrollmentSwitchProps) => {
  const { wallet, isStaged, onValueChange } = props;

  const configurationMachine = useConfigurationMachineService();

  const instrumentStatusPot = useSelector(
    configurationMachine,
    instrumentStatusByIdWalletSelector(wallet.idWallet)
  );

  const instrumentMaskedPan = getPaymentMaskedPan(wallet);

  const badge = pipe(
    pot.toOption(instrumentStatusPot),
    O.chain(O.fromNullable),
    O.filter(
      status =>
        status === InstrumentStatusEnum.PENDING_ENROLLMENT_REQUEST ||
        status === InstrumentStatusEnum.PENDING_DEACTIVATION_REQUEST
    ),
    O.fold(
      () => undefined,
      status =>
        ({
          text: instrumentStatusLabels[status],
          variant: "blue"
        } as Badge)
    )
  );

  const isActive = pot.getOrElse(
    pot.map(
      instrumentStatusPot,
      status => status === InstrumentStatusEnum.ACTIVE
    ),
    false
  );

  const switchValue = pot.getOrElse(
    pot.map(
      instrumentStatusPot,
      status => status === InstrumentStatusEnum.ACTIVE || isStaged
    ),
    isActive
  );

  const iconProps = pipe(
    CreditCardType.decode(wallet.creditCard?.brand?.toUpperCase()),
    E.map(brand => cardLogoByBrand[brand]),
    E.fold(
      () => ({ icon: "creditCard" } as ListItemSwitchIconProps),
      paymentLogo => ({ paymentLogo } as ListItemSwitchIconProps)
    )
  );

  return (
    <ListItemSwitch
      {...iconProps}
      label={`•••• ${instrumentMaskedPan}`}
      value={switchValue}
      onSwitchValueChange={() => onValueChange(!isActive)}
      isLoading={pot.isLoading(instrumentStatusPot)}
      badge={badge}
    />
  );
};

export const cardLogoByBrand: {
  [key in CreditCardType]: IOLogoPaymentType | undefined;
} = {
  MASTERCARD: "mastercard",
  VISA: "visa",
  AMEX: "amex",
  DINERS: "diners",
  MAESTRO: "maestro",
  VISAELECTRON: "visa",
  POSTEPAY: "postepay",
  UNIONPAY: "unionPay",
  DISCOVER: "discover",
  JCB: "jcb",
  JCB15: "jcb",
  UNKNOWN: undefined
};

const getPaymentMaskedPan = (wallet: Wallet): string => {
  switch (wallet.type) {
    case "CREDIT_CARD":
      return wallet.creditCard?.pan ?? "";
    default:
      return "";
  }
};

export { InstrumentEnrollmentSwitch };
