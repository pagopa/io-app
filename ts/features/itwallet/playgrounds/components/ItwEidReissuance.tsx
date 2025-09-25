import { Alert, View } from "react-native";
import I18n from "i18next";
import { IOButton, ListItemHeader } from "@pagopa/io-app-design-system";
import { ItwEidIssuanceMachineContext } from "../../machine/eid/provider";
import {
  itwLifecycleIsITWalletValidSelector,
  itwLifecycleIsValidSelector
} from "../../lifecycle/store/selectors";
import { useIOSelector } from "../../../../store/hooks";

export const ItwReissuanceSection = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isWalletValid = useIOSelector(itwLifecycleIsValidSelector);
  const isItwL3 = useIOSelector(itwLifecycleIsITWalletValidSelector);

  if (!isWalletValid || isItwL3) {
    return null;
  }

  const confirmReissuance = () => {
    Alert.alert(
      I18n.t("features.itWallet.playgrounds.reissuing.alert.title"),
      I18n.t("features.itWallet.playgrounds.reissuing.alert.content"),
      [
        { text: I18n.t("global.buttons.cancel"), style: "cancel" },
        {
          text: I18n.t("global.buttons.confirm"),
          style: "destructive",
          onPress: () => {
            machineRef.send({ type: "start", mode: "reissuance" });
          }
        }
      ],
      { cancelable: true }
    );
  };

  return (
    <View>
      <ListItemHeader label="eID reissuance" />
      <IOButton
        variant="solid"
        color="danger"
        label="Start reissuance"
        onPress={confirmReissuance}
      />
    </View>
  );
};
