import React from "react";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import {
  trackAddFirstCredential,
  trackBackToWallet,
  trackSaveCredentialSuccess,
  updateITWStatusAndIDProperties
} from "../../analytics";
import { useIOStore } from "../../../../store/hooks";

const ITW_CREDENTIAL = "ITW_ID_V2";

export const ItwIssuanceEidResultScreen = () => {
  const route = useRoute();
  const store = useIOStore();

  useFocusEffect(() => {
    trackSaveCredentialSuccess(ITW_CREDENTIAL);
    updateITWStatusAndIDProperties(store.getState());
  });

  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  const handleContinue = () => {
    machineRef.send({ type: "add-new-credential" });
    trackAddFirstCredential();
  };

  const handleClose = async () => {
    machineRef.send({ type: "go-to-wallet" });
    trackBackToWallet({ exit_page: route.name, credential: ITW_CREDENTIAL });
    updateITWStatusAndIDProperties(store.getState());
  };

  return (
    <OperationResultScreenContent
      pictogram="success"
      title={I18n.t("features.itWallet.issuance.eidResult.success.title")}
      subtitle={I18n.t("features.itWallet.issuance.eidResult.success.subtitle")}
      action={{
        label: I18n.t(
          "features.itWallet.issuance.eidResult.success.actions.continue"
        ),
        onPress: handleContinue
      }}
      secondaryAction={{
        label: I18n.t(
          "features.itWallet.issuance.eidResult.success.actions.close"
        ),
        onPress: handleClose
      }}
    />
  );
};
