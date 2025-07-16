import { useRoute } from "@react-navigation/native";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { trackAddFirstCredential, trackBackToWallet } from "../../analytics";
import { useIOSelector } from "../../../../store/hooks";
import { itwLifecycleIsITWalletValidSelector } from "../../lifecycle/store/selectors";

export const ItwIssuanceEidResultScreen = () => {
  const route = useRoute();

  const isItWalletValid = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  const handleContinue = () => {
    machineRef.send({ type: "add-new-credential" });
    trackAddFirstCredential();
  };

  const handleBackToWallet = () => machineRef.send({ type: "go-to-wallet" });

  // The user successfully activated IT-Wallet
  if (isItWalletValid) {
    return (
      <OperationResultScreenContent
        pictogram="success"
        title={I18n.t("features.itWallet.issuance.eidResult.successL3.title")}
        subtitle={I18n.t(
          "features.itWallet.issuance.eidResult.successL3.subtitle"
        )}
        action={{
          label: I18n.t(
            "features.itWallet.issuance.eidResult.successL3.actions.continue"
          ),
          onPress: handleBackToWallet
        }}
      />
    );
  }

  // The user successfully activated Documenti su IO
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
        onPress: () => {
          handleBackToWallet();
          trackBackToWallet({ exit_page: route.name, credential: "ITW_ID_V2" });
        }
      }}
    />
  );
};
