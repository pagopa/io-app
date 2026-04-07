import I18n from "i18next";
import { useEffect } from "react";

import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useAvoidHardwareBackButton } from "../../../../../utils/useAvoidHardwareBackButton.ts";
import { useItwDisableGestureNavigation } from "../../../common/hooks/useItwDisableGestureNavigation";
import { trackItwProximityPresentationCompleted } from "../analytics";
import { ItwProximityLoadingStepScreen } from "../components/ItwProximityLoadingStepScreen.tsx";
import { ItwProximityMachineContext } from "../machine/provider.tsx";
import { selectIsSuccess } from "../machine/selectors.ts";

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
      action={{
        label: I18n.t("global.buttons.close"),
        onPress: closeMachine
      }}
      pictogram="success"
      subtitle={I18n.t(
        "features.itWallet.presentation.proximity.success.subtitle"
      )}
      title={I18n.t("features.itWallet.presentation.proximity.success.title")}
    />
  );
};
