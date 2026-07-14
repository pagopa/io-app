import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback } from "react";

import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useAvoidHardwareBackButton } from "../../../../../utils/useAvoidHardwareBackButton";
import { useItwDisableGestureNavigation } from "../../../common/hooks/useItwDisableGestureNavigation";
import { trackItwProximityPresentationCompleted } from "../analytics";
import { ItwProximityMachineContext } from "../machine/provider";

export const ItwProximitySuccessScreen = () => {
  const machineRef = ItwProximityMachineContext.useActorRef();

  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  useFocusEffect(
    useCallback(() => trackItwProximityPresentationCompleted(), [])
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
