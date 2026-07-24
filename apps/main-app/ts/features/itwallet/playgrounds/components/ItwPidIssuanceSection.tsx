import { ListItemHeader, ListItemNav } from "@io-app/design-system";
import { IntegrityError } from "@pagopa/io-react-native-integrity";
import I18n from "i18next";
import { useCallback } from "react";
import { Alert, View } from "react-native";

import { EidIssuanceLevel } from "../../machine/eid/context";
import { IssuanceFailureType } from "../../machine/eid/failure";
import { ItwEidIssuanceMachineContext } from "../../machine/eid/provider";

export const ItwPidIssuanceSection = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

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

  const simulateHardwareKeyInvalidError = useCallback(() => {
    const fakeError = Object.assign(new Error("GENERATION_ASSERTION_FAILED"), {
      userInfo: {
        error:
          "Impossibile completare l'operazione. (Errore com.apple.devicecheck.error 3)."
      }
    }) as unknown as IntegrityError;

    machineRef.send({
      type: "simulate-failure",
      failure: {
        type: IssuanceFailureType.HARDWARE_KEY_INVALID,
        reason: fakeError
      }
    });
  }, [machineRef]);

  return (
    <View>
      <ListItemHeader label="PID issuance" />
      <ListItemNav
        description="Start L2 PID (Documenti su IO) issuance"
        onPress={startIssuance("l2")}
        value="Start L2 issuance"
      />
      <ListItemNav
        description="Start L3 PID (IT Wallet) issuance"
        onPress={startIssuance("l3")}
        value="Start L3 issuance"
      />
      <ListItemHeader label="PID issuance from add credential" />
      <ListItemNav
        description="Simulate PID issuance triggered by selecting mDL (skips catalog)"
        onPress={() =>
          machineRef.send({
            type: "start",
            mode: "issuance",
            level: "l3",
            credentialType: "mDL"
          })
        }
        value="Start credential-triggered issuance"
      />
      <ListItemHeader label="PID upgrade" />
      <ListItemNav
        description="Start L3 PID (IT Wallet) upgrade from L2"
        onPress={startUpgrade("l3")}
        value="Start L3 upgrade"
      />
      <ListItemHeader label="PID reissuance" />
      <ListItemNav
        description="Start L2 PID (Documenti su IO) reissuance"
        onPress={startReissuance("l2")}
        value="Start L2 reissuance"
      />
      <ListItemNav
        description="Start L3 PID (IT Wallet) reissuance"
        onPress={startReissuance("l3")}
        value="Start L3 reissuance"
      />
      <ListItemHeader label="Failure simulation" />
      <ListItemNav
        description="Simulate GENERATION_ASSERTION_FAILED"
        onPress={simulateHardwareKeyInvalidError}
        value="Simulate hardware key invalid error"
      />
    </View>
  );
};
