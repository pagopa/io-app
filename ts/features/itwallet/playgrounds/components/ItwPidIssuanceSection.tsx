import {
  IOButton,
  ListItemHeader,
  ListItemNav
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useCallback } from "react";
import { Alert, View } from "react-native";
import { useIOSelector } from "../../../../store/hooks";
import {
  itwLifecycleIsITWalletValidSelector,
  itwLifecycleIsValidSelector
} from "../../lifecycle/store/selectors";
import { EidIssuanceLevel } from "../../machine/eid/context";
import { ItwEidIssuanceMachineContext } from "../../machine/eid/provider";

export const ItwPidIssuanceSection = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isWalletValid = useIOSelector(itwLifecycleIsValidSelector);
  const isItwL3 = useIOSelector(itwLifecycleIsITWalletValidSelector);

  const startIssuance = useCallback(
    (level: EidIssuanceLevel) => () => {
      machineRef.send({ type: "start", mode: "issuance", level });
    },
    [machineRef]
  );

  const startUpgrade = useCallback(
    (level: EidIssuanceLevel) => () => {
      machineRef.send({ type: "start", mode: "upgrade", level });
    },
    [machineRef]
  );

  const startReissuance = useCallback(
    (level: EidIssuanceLevel) => () => {
      Alert.alert(
        I18n.t("features.itWallet.playgrounds.reissuing.alert.title"),
        I18n.t("features.itWallet.playgrounds.reissuing.alert.content"),
        [
          { text: I18n.t("global.buttons.cancel"), style: "cancel" },
          {
            text: I18n.t("global.buttons.confirm"),
            style: "destructive",
            onPress: () => {
              machineRef.send({ type: "start", mode: "reissuance", level });
            }
          }
        ],
        { cancelable: true }
      );
    },
    [machineRef]
  );

  return (
    <View>
      <ListItemHeader label="PID issuance" />
      <ListItemNav
        value="Start L2 issuance"
        description="Start L2 PID (Documenti su IO) issuance"
        onPress={startIssuance("l2")}
      />
      <ListItemNav
        value="Start L2+ issuance"
        description="Start L3 PID (IT Wallet) issuance with L2+ flow"
        onPress={startIssuance("l2-plus")}
      />
      <ListItemNav
        value="Start L3 issuance"
        description="Start L3 PID (IT Wallet) issuance"
        onPress={startIssuance("l3")}
      />
      <ListItemHeader label="PID upgrade" />
      <IOButton
        variant="solid"
        color="danger"
        label="Start L3 upgrade"
        onPress={startUpgrade("l3")}
        disabled={!isWalletValid || isItwL3}
      />
      <ListItemHeader label="PID reissuance" />
      <IOButton
        variant="solid"
        color="danger"
        label="Start L2 reissuance"
        onPress={startReissuance("l2")}
        disabled={!isWalletValid}
      />
    </View>
  );
};
