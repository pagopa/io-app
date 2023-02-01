import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { ListItem } from "native-base";
import { default as React, forwardRef, useImperativeHandle } from "react";
import { View, StyleSheet } from "react-native";
import {
  InstrumentDTO,
  StatusEnum
} from "../../../../../../definitions/idpay/wallet/InstrumentDTO";
import { IOBadge } from "../../../../../components/core/IOBadge";
import { H4 } from "../../../../../components/core/typography/H4";
import Switch from "../../../../../components/ui/Switch";
import { Wallet } from "../../../../../types/pagopa";
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

  const getPaymentMethodInfo = (wallet: Wallet): O.Option<InstrumentInfo> => {
    switch (wallet.type) {
      case "CREDIT_CARD":
        return O.some({
          logo: <View />,
          maskedPan: wallet.creditCard?.pan ?? ""
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
        <IOBadge
          variant="solid"
          color="blue"
          text={instrumentStatusLabels[status]}
        />
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
        <H4>{instrumentInfo.maskedPan}</H4>
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
  }
});

export { InstrumentEnrollmentSwitch };
