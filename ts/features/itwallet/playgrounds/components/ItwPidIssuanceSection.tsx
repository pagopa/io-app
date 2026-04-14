import { ListItemHeader, ListItemNav } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useCallback } from "react";
import { Alert, View } from "react-native";
import { IntegrityError } from "@pagopa/io-react-native-integrity";
import { EidIssuanceLevel } from "../../machine/eid/context";
import { ItwEidIssuanceMachineContext } from "../../machine/eid/provider";
import { IssuanceFailureType } from "../../machine/eid/failure";

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
        value="Start L2 issuance"
        description="Start L2 PID (Documenti su IO) issuance"
        onPress={startIssuance("l2")}
      />
      <ListItemNav
        value="Start L3 issuance"
        description="Start L3 PID (IT Wallet) issuance"
        onPress={startIssuance("l3")}
      />
      <ListItemHeader label="PID issuance from add credential" />
      <ListItemNav
        value="Start credential-triggered issuance"
        description="Simulate PID issuance triggered by selecting mDL (skips catalog)"
        onPress={() =>
          machineRef.send({
            type: "start",
            mode: "issuance",
            level: "l3",
            credentialType: "mDL"
          })
        }
      />
      <ListItemHeader label="PID upgrade" />
      <ListItemNav
        value="Start L3 upgrade"
        description="Start L3 PID (IT Wallet) upgrade from L2"
        onPress={startUpgrade("l3")}
      />
      <ListItemHeader label="PID reissuance" />
      <ListItemNav
        value="Start L2 reissuance"
        description="Start L2 PID (Documenti su IO) reissuance"
        onPress={startReissuance("l2")}
      />
      <ListItemNav
        value="Start L3 reissuance"
        description="Start L3 PID (IT Wallet) reissuance"
        onPress={startReissuance("l3")}
      />
      <ListItemHeader label="Failure simulation" />
      <ListItemNav
        value="Simulate hardware key invalid error"
        description="Simulate GENERATION_ASSERTION_FAILED"
        onPress={simulateHardwareKeyInvalidError}
      />
    </View>
  );
};
