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
  trackSaveCredentialSuccess
} from "../../analytics";
import { updateMixpanelProfileProperties } from "../../../../mixpanelConfig/profileProperties";
import { useIOStore } from "../../../../store/hooks";
import { updateMixpanelSuperProperties } from "../../../../mixpanelConfig/superProperties";

const ITW_CREDENTIAL = "ITW_ID";

export const ItwIssuanceEidResultScreen = () => {
  const route = useRoute();

  useFocusEffect(() => trackSaveCredentialSuccess(ITW_CREDENTIAL));

  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  const store = useIOStore();

  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  const handleContinue = () => {
    machineRef.send({ type: "add-new-credential" });
    trackAddFirstCredential();
  };

  const handleClose = async () => {
    machineRef.send({ type: "go-to-wallet" });
    trackBackToWallet({ exit_page: route.name, credential: ITW_CREDENTIAL });
    void updateMixpanelProfileProperties(store.getState());
    void updateMixpanelSuperProperties(store.getState());
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
