import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "../../../../../i18n";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { ItwEidIssuanceMachineContext } from "../../../machine/provider";
import { useItwPreventNavigationEvent } from "../../../common/hooks/useItwPreventNavigationEvent";
import { trackItWalletCieCardVerifyFailure } from "../../../analytics";

export const ItwCieExpiredOrInvalidScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  useItwPreventNavigationEvent();

  useFocusEffect(trackItWalletCieCardVerifyFailure);

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
