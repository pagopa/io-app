import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useIODispatch } from "../../../../../store/hooks";
import { identificationRequest } from "../../../../identification/store/actions";
import { ItwProximityMachineContext } from "../machine/provider";

export const ItwProximityStoreConsentScreen = () => {
  const dispatch = useIODispatch();
  const machineRef = ItwProximityMachineContext.useActorRef();

  const confirmConsentStore = () =>
    dispatch(
      identificationRequest(
        false,
        true,
        undefined,
        {
          label: I18n.t("global.buttons.cancel"),
          onCancel: () => undefined
        },
        {
          onSuccess: () => machineRef.send({ type: "store-consent" })
        }
      )
    );

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
        onPress: confirmConsentStore
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
