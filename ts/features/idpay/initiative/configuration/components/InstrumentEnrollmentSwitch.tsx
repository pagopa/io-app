import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { Badge, ListItem } from "native-base";
import { default as React, forwardRef, useImperativeHandle } from "react";
import { StyleSheet, View } from "react-native";
import {
  InstrumentDTO,
  StatusEnum
} from "../../../../../../definitions/idpay/wallet/InstrumentDTO";
import { Icon } from "../../../../../components/core/icons";
import LogoPayment, {
  IOLogoPaymentType
} from "../../../../../components/core/logos/LogoPayment";
import { HSpacer } from "../../../../../components/core/spacer/Spacer";
import { H4 } from "../../../../../components/core/typography/H4";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import Switch from "../../../../../components/ui/Switch";
import { CreditCardType, Wallet } from "../../../../../types/pagopa";
import { instrumentStatusLabels } from "../../../common/labels";

export type InstrumentEnrollmentSwitchRef = {
  switchStatus: boolean;
  setSwitchStatus: (status: boolean) => void;
};

type InstrumentEnrollmentSwitchProps = {
  wallet: Wallet;
  status?: InstrumentDTO["status"];
  isDisabled?: boolean;
  onSwitch: (walletId: number, isEnrolling: boolean) => void;
};

type InstrumentInfo = {
  logo: JSX.Element;
  maskedPan: string;
};

/**
 * A component to enable/disable the enrollment of an instrument
 */
const InstrumentEnrollmentSwitch = forwardRef<
  InstrumentEnrollmentSwitchRef,
  InstrumentEnrollmentSwitchProps
>((props, ref) => {
  const { wallet, status, isDisabled, onSwitch } = props;

  const [switchStatus, setSwitchStatus] = React.useState(
    status === StatusEnum.ACTIVE
  );

  useImperativeHandle(ref, () => ({
    switchStatus,
    setSwitchStatus
  }));

  const handleChange = () => {
    setSwitchStatus(!switchStatus);
    onSwitch(wallet.idWallet, !switchStatus);
  };

  const cardLogos: {
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

  const getPaymentMethodInfo = (wallet: Wallet): O.Option<InstrumentInfo> => {
    switch (wallet.type) {
      case "CREDIT_CARD":
        const logo =
          cardLogos[
            pipe(
              CreditCardType.decode(wallet.creditCard?.brand?.toUpperCase()),
              E.getOrElseW(() => "UNKNOWN" as const)
            )
          ];
        return O.some({
          logo:
            logo === undefined ? (
              <Icon name="creditCard" size={24} color={"bluegrey"} />
            ) : (
              <LogoPayment name={logo} size={24} />
            ),
          maskedPan:
            wallet.creditCard?.pan === undefined
              ? ""
              : `•••• ${wallet.creditCard.pan}`
        });
      default:
        return O.none;
    }
  };

  const renderControl = () => {
    if (
      status === StatusEnum.PENDING_ENROLLMENT_REQUEST ||
      status === StatusEnum.PENDING_DEACTIVATION_REQUEST
    ) {
      return (
        <Badge style={styles.badge}>
          <LabelSmall color="white">
            {instrumentStatusLabels[status]}
          </LabelSmall>
        </Badge>
      );
    }

    return (
      <Switch
        value={switchStatus}
        onChange={handleChange}
        disabled={isDisabled}
      />
    );
  };

  const instrumentInfo = pipe(
    getPaymentMethodInfo(wallet),
    O.getOrElse(() => ({
      logo: <View />,
      maskedPan: ""
    }))
  );

  return (
    <ListItem>
      <View style={styles.listItemContainer}>
        <View style={styles.logoAndPanContainer}>
          {instrumentInfo.logo}
          <HSpacer size={8} />
          <H4>{instrumentInfo.maskedPan}</H4>
        </View>
        {renderControl()}
      </View>
    </ListItem>
  );
});

const styles = StyleSheet.create({
  listItemContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  badge: {
    height: 24,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: IOColors.blue
  },
  logoAndPanContainer: {
    flexDirection: "row",
    alignItems: "center"
  }
});

export { InstrumentEnrollmentSwitch };
