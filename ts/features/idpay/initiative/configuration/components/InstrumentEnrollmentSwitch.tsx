import * as p from "@pagopa/ts-commons/lib/pot";
import { Badge as NBBadge, ListItem as NBListItem } from "native-base";
import { default as React, forwardRef, useImperativeHandle } from "react";
import { Image, StyleSheet, View } from "react-native";
import { StatusEnum as InstrumentStatusEnum } from "../../../../../../definitions/idpay/wallet/InstrumentDTO";
import defaultCardIcon from "../../../../../../img/wallet/cards-icons/unknown.png";
import { RemoteSwitch } from "../../../../../components/core/selection/RemoteSwitch";
import { HSpacer } from "../../../../../components/core/spacer/Spacer";
import { H4 } from "../../../../../components/core/typography/H4";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { getCardIconFromBrandLogo } from "../../../../../components/wallet/card/Logo";
import { Wallet } from "../../../../../types/pagopa";
import { instrumentStatusLabels } from "../../../common/labels";

export type InstrumentEnrollmentSwitchRef = {
  switchStatus: boolean;
  setSwitchStatus: (status: boolean) => void;
};

type InstrumentEnrollmentSwitchProps = {
  wallet: Wallet;
  status: p.Pot<InstrumentStatusEnum | undefined, Error>;
  onSwitch: (walletId: number, isEnrolling: boolean) => void;
};

type InstrumentInfo = {
  logo: JSX.Element;
  maskedPan?: string;
};

/**
 * A component to enable/disable the enrollment of an instrument
 */
const InstrumentEnrollmentSwitch = forwardRef<
  InstrumentEnrollmentSwitchRef,
  InstrumentEnrollmentSwitchProps
>((props, ref) => {
  const { wallet, status, onSwitch } = props;

  const [switchStatus, setSwitchStatus] = React.useState(
    p.getOrElse(
      p.map(status, s => s === InstrumentStatusEnum.ACTIVE),
      false
    )
  );

  useImperativeHandle(ref, () => ({
    switchStatus,
    setSwitchStatus
  }));

  const handleChange = (value: boolean) => {
    setSwitchStatus(value);
    onSwitch(wallet.idWallet, value);
  };

  const renderControl = () => {
    if (
      p.isSome(status) &&
      (status.value === InstrumentStatusEnum.PENDING_ENROLLMENT_REQUEST ||
        status.value === InstrumentStatusEnum.PENDING_DEACTIVATION_REQUEST)
    ) {
      return (
        <NBBadge style={styles.badge}>
          <LabelSmall color="white">
            {instrumentStatusLabels[status.value]}
          </LabelSmall>
        </NBBadge>
      );
    }

    return (
      <RemoteSwitch value={p.some(switchStatus)} onValueChange={handleChange} />
    );
  };

  const instrumentInfo = getPaymentMethodInfo(wallet);

  return (
    <NBListItem>
      <View style={[IOStyles.flex, IOStyles.rowSpaceBetween]}>
        <View style={styles.instrumentsInfo}>
          {instrumentInfo.logo}
          <HSpacer size={8} />
          <H4>{`•••• ${instrumentInfo.maskedPan}`}</H4>
        </View>
        {renderControl()}
      </View>
    </NBListItem>
  );
});

const getPaymentMethodInfo = (wallet: Wallet): InstrumentInfo => {
  const getLogoSource = () => {
    if (wallet.psp?.logoPSP) {
      return { uri: wallet.psp?.logoPSP };
    }

    if (wallet.paymentMethod?.info) {
      return getCardIconFromBrandLogo(wallet.paymentMethod?.info);
    }
    return defaultCardIcon;
  };

  switch (wallet.type) {
    case "CREDIT_CARD":
      return {
        logo: <Image style={styles.issuerLogo} source={getLogoSource()} />,
        maskedPan: wallet.creditCard?.pan
      };
    default:
      return {
        logo: <View />
      };
  }
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
