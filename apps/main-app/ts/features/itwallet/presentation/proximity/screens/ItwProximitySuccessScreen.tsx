import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback } from "react";

import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useAvoidHardwareBackButton } from "../../../../../utils/useAvoidHardwareBackButton";
import { useItwDisableGestureNavigation } from "../../../common/hooks/useItwDisableGestureNavigation";
import { trackItwProximityPresentationCompleted } from "../analytics";
import { ItwProximityMachineContext } from "../machine/provider";
import { selectProximityFlow } from "../machine/selectors";

export const ItwProximitySuccessScreen = () => {
  const machineRef = ItwProximityMachineContext.useActorRef();
  const proximityFlow =
    ItwProximityMachineContext.useSelector(selectProximityFlow);

  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  useFocusEffect(
    useCallback(
      () =>
        trackItwProximityPresentationCompleted({
          proximity_flow: proximityFlow
        }),
      [proximityFlow]
    )
  );

  const closeMachine = () => machineRef.send({ type: "close" });

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
