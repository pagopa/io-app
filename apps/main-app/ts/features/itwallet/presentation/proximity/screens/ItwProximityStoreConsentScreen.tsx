import I18n from "i18next";

import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useIODispatch } from "../../../../../store/hooks";
import { identificationRequest } from "../../../../identification/store/actions";
import { ItwProximityMachineContext } from "../machine/provider";
import { selectIsLoading } from "../machine/selectors";

export const ItwProximityStoreConsentScreen = () => {
  const dispatch = useIODispatch();
  const machineRef = ItwProximityMachineContext.useActorRef();
  const isLoading = ItwProximityMachineContext.useSelector(selectIsLoading);

  const handleContinue =
    (storeConsent: boolean = false) =>
    () =>
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
            onSuccess: () =>
              machineRef.send(
                storeConsent ? { type: "store-consent" } : { type: "continue" }
              )
          }
        )
      );

  return (
    <LoadingSpinnerOverlay isLoading={isLoading}>
      <OperationResultScreenContent
        action={{
          label: I18n.t(
            "features.itWallet.presentation.proximity.storeConsent.action"
          ),
          onPress: handleContinue(true)
        }}
        pictogram="activate"
        secondaryAction={{
          label: I18n.t(
            "features.itWallet.presentation.proximity.storeConsent.secondaryAction"
          ),
          onPress: handleContinue()
        }}
        subtitle={I18n.t(
          "features.itWallet.presentation.proximity.storeConsent.subtitle"
        )}
        title={I18n.t(
          "features.itWallet.presentation.proximity.storeConsent.title"
        )}
      />
    </LoadingSpinnerOverlay>
  );
};
