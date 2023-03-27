import * as pot from "@pagopa/ts-commons/lib/pot";
import { useSelector } from "@xstate/react";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { Badge as NBBadge, ListItem as NBListItem } from "native-base";
import { default as React } from "react";
import { Image, StyleSheet, View } from "react-native";
import {
  InstrumentDTO,
  StatusEnum as InstrumentStatusEnum
} from "../../../../../../definitions/idpay/InstrumentDTO";
import defaultCardIcon from "../../../../../../img/wallet/cards-icons/unknown.png";
import {
  IOLogoPaymentType,
  LogoPayment
} from "../../../../../components/core/logos";
import { RemoteSwitch } from "../../../../../components/core/selection/RemoteSwitch";
import { HSpacer } from "../../../../../components/core/spacer/Spacer";
import { H4 } from "../../../../../components/core/typography/H4";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { CreditCardType, Wallet } from "../../../../../types/pagopa";
import { instrumentStatusLabels } from "../../../common/labels";
import { useConfigurationMachineService } from "../xstate/provider";
import {
  instrumentStatusByIdWalletSelector,
  isInstrumentEnrollingSelector
} from "../xstate/selectors";

export type InstrumentEnrollmentSwitchRef = {
  switchStatus: boolean;
  setSwitchStatus: (status: boolean) => void;
};

type InstrumentEnrollmentSwitchProps = {
  wallet: Wallet;
  instrument?: InstrumentDTO;
};

/**
 * A component to enable/disable the enrollment of an instrument
 */
const InstrumentEnrollmentSwitch = (props: InstrumentEnrollmentSwitchProps) => {
  const { wallet, instrument } = props;

  const configurationMachine = useConfigurationMachineService();

  const isEnrolling = useSelector(
    configurationMachine,
    isInstrumentEnrollingSelector(wallet.idWallet)
  );

  const instrumentStatus = useSelector(
    configurationMachine,
    instrumentStatusByIdWalletSelector(wallet.idWallet)
  );

  const handleChange = (value: boolean) => {
    if (value) {
      configurationMachine.send("STAGE_INSTRUMENT", {
        instrument: wallet
      });
    } else {
      configurationMachine.send("DELETE_INSTRUMENT", {
        instrument
      });
    }
  };

  const renderSwitch = () => {
    if (pot.isSome(instrumentStatus)) {
      const status = instrumentStatus.value;

      if (
        status === InstrumentStatusEnum.PENDING_ENROLLMENT_REQUEST ||
        status === InstrumentStatusEnum.PENDING_DEACTIVATION_REQUEST
      ) {
        return (
          <NBBadge style={styles.badge}>
            <LabelSmall color="white">
              {instrumentStatusLabels[status]}
            </LabelSmall>
          </NBBadge>
        );
      }
    }

    const switchValue = pot.map(
      instrumentStatus,
      status => status === InstrumentStatusEnum.ACTIVE || isEnrolling
    );

    return <RemoteSwitch value={switchValue} onValueChange={handleChange} />;
  };

  const instrumentLogo = getPaymentMethodLogo(wallet);
  const instrumentMaskedPan = getPaymentMaskedPan(wallet);

  return (
    <NBListItem>
      <View style={[IOStyles.flex, IOStyles.rowSpaceBetween]}>
        <View style={styles.instrumentsInfo}>
          {instrumentLogo}
          <HSpacer size={8} />
          <H4>{`•••• ${instrumentMaskedPan}`}</H4>
        </View>
        {renderSwitch()}
      </View>
    </NBListItem>
  );
};

export const cardLogos: {
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

const getPaymentMethodLogo = (wallet: Wallet): JSX.Element => {
  switch (wallet.type) {
    case "CREDIT_CARD":
      const creditCardType = CreditCardType.decode(
        wallet.creditCard?.brand?.toUpperCase()
      );

      const logo =
        cardLogos[
          pipe(
            creditCardType,
            E.getOrElseW(() => "UNKNOWN" as const)
          )
        ];

      if (logo !== undefined) {
        return <LogoPayment name={logo} size={24} />;
      }
  }

  return <Image style={styles.issuerLogo} source={defaultCardIcon} />;
};

const styles = StyleSheet.create({
  badge: {
    height: 24,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: IOColors.blue
  },
  issuerLogo: {
    width: 24,
    height: 16,
    resizeMode: "contain"
  },
  instrumentsInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  }
});

export { InstrumentEnrollmentSwitch };
