import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useItwDisableGestureNavigation } from "../../../common/hooks/useItwDisableGestureNavigation";
import { useAvoidHardwareBackButton } from "../../../../../utils/useAvoidHardwareBackButton.ts";
import { ItwProximityMachineContext } from "../machine/provider.tsx";
import I18n from "../../../../../i18n.ts";
import { selectIsSuccess } from "../machine/selectors.ts";
import { ItwProximityLoadingScreen } from "../components/ItwProximityLoadingScreen.tsx";

export const ItwProximitySendDocumentsResponseScreen = () => {
  const machineRef = ItwProximityMachineContext.useActorRef();
  const isSuccess = ItwProximityMachineContext.useSelector(selectIsSuccess);

  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  const closeMachine = () => machineRef.send({ type: "close" });

  // We need to ensure that the current state is not `Success` to prevent a visual glitch
  // that occurs when any failure causes the machine to transition to the `Failure` state
  if (!isSuccess) {
    return (
      <ItwProximityLoadingScreen
        title={I18n.t(
          "features.itWallet.presentation.proximity.loadingScreen.title"
        )}
      />
    );
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
