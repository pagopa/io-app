import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Badge, ListItem, View } from "native-base";
import { default as React, forwardRef, useImperativeHandle } from "react";
import { StyleSheet } from "react-native";
import {
  InstrumentDTO,
  StatusEnum
} from "../../../../../../definitions/idpay/wallet/InstrumentDTO";
import { H4 } from "../../../../../components/core/typography/H4";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOColors } from "../../../../../components/core/variables/IOColors";
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
  },
  badge: {
    height: 24,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: IOColors.blue
  }
});

export { InstrumentEnrollmentSwitch };
