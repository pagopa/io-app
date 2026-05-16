import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { ItwProximityMachineContext } from "../machine/provider";

export const ItwProximityStoreConsentScreen = () => {
  const machineRef = ItwProximityMachineContext.useActorRef();

  return (
    <OperationResultScreenContent
      pictogram="activate"
      title={I18n.t(
        "features.itWallet.presentation.proximity.storeConsent.title"
      )}
      subtitle={I18n.t(
        "features.itWallet.presentation.proximity.storeConsent.subtitle"
      )}
      action={{
        label: I18n.t(
          "features.itWallet.presentation.proximity.storeConsent.action"
        ),
        onPress: () => machineRef.send({ type: "store-consent" })
      }}
      secondaryAction={{
        label: I18n.t(
          "features.itWallet.presentation.proximity.storeConsent.secondaryAction"
        ),
        onPress: () => machineRef.send({ type: "continue" })
      }}
    />
  );
};
