import { useEffect } from "react";
import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { ItwProximityLoadingStepScreen } from "../components/ItwProximityLoadingStepScreen.tsx";
import { useItwDisableGestureNavigation } from "../../../common/hooks/useItwDisableGestureNavigation";
import { useAvoidHardwareBackButton } from "../../../../../utils/useAvoidHardwareBackButton.ts";
import { ItwProximityMachineContext } from "../machine/provider.tsx";
import { selectIsSuccess } from "../machine/selectors.ts";
import { trackItwProximityPresentationCompleted } from "../analytics";

export const ItwProximitySendDocumentsResponseScreen = () => {
  const machineRef = ItwProximityMachineContext.useActorRef();
  const isSuccess = ItwProximityMachineContext.useSelector(selectIsSuccess);

  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  const closeMachine = () => machineRef.send({ type: "close" });

  useEffect(() => {
    if (isSuccess) {
      trackItwProximityPresentationCompleted();
    }
  }, [isSuccess]);

  // We need to ensure that the current state is not `Success` to prevent a visual glitch
  // that occurs when any failure causes the machine to transition to the `Failure` state
  if (!isSuccess) {
    return <ItwProximityLoadingStepScreen />;
  }

  return (
    <OperationResultScreenContent
      pictogram="success"
      title={I18n.t("features.itWallet.presentation.proximity.success.title")}
      subtitle={I18n.t(
        "features.itWallet.presentation.proximity.success.subtitle"
      )}
      action={{
        label: I18n.t("global.buttons.close"),
        onPress: closeMachine
      }}
    />
  );
};
