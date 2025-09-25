import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import { useItwPreventNavigationEvent } from "../../../common/hooks/useItwPreventNavigationEvent";
import { trackItWalletCieCardVerifyFailure } from "../../../analytics";
import { isL3FeaturesEnabledSelector } from "../../../machine/eid/selectors";
import { ItwCieMachineContext } from "../machine/provider";
import { selectReadProgress } from "../machine/selectors";

export const ItwCieExpiredOrInvalidScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isL3Enabled = ItwEidIssuanceMachineContext.useSelector(
    isL3FeaturesEnabledSelector
  );
  const readProgress = ItwCieMachineContext.useSelector(selectReadProgress);

  useItwPreventNavigationEvent();

  useFocusEffect(
    useCallback(() => {
      trackItWalletCieCardVerifyFailure({
        itw_flow: isL3Enabled ? "L3" : "L2",
        reason: "certificate expired",
        cie_reading_progress: readProgress
      });
    }, [isL3Enabled, readProgress])
  );

  const handleClose = useCallback(() => {
    machineRef.send({ type: "close" });
  }, [machineRef]);

  return (
    <OperationResultScreenContent
      pictogram="attention"
      title={I18n.t("authentication.landing.expiredCardTitle")}
      subtitle={I18n.t("authentication.landing.expiredCardContent")}
      action={{
        label: I18n.t("global.buttons.close"),
        accessibilityLabel: I18n.t("global.buttons.close"),
        onPress: handleClose
      }}
    />
  );
};
