import I18n from "i18next";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useOfflineToastGuard } from "../../../../hooks/useOfflineToastGuard.ts";
import { useIOSelector } from "../../../../store/hooks.ts";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import { ItwEidIssuanceMachineContext } from "../../machine/eid/provider";
import { selectIsLoading } from "../../machine/eid/selectors";
import { itwLifecycleIsITWalletValidSelector } from "../store/selectors/index.ts";

const RevocationLoadingScreen = () => {
  const isItwL3 = useIOSelector(itwLifecycleIsITWalletValidSelector);
  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  return (
    <LoadingScreenContent
      title={I18n.t("features.itWallet.walletRevocation.loadingScreen.title", {
        name: isItwL3 ? "IT-Wallet" : "Documenti su IO"
      })}
      subtitle={I18n.t(
        "features.itWallet.walletRevocation.loadingScreen.subtitle"
      )}
    />
  );
};

export const ItwLifecycleWalletRevocationScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isLoading = ItwEidIssuanceMachineContext.useSelector(selectIsLoading);

  const handleRevokeWalletInstance = useOfflineToastGuard(() =>
    machineRef.send({ type: "revoke-wallet-instance" })
  );

  if (isLoading) {
    return <RevocationLoadingScreen />;
  }

  return (
    <OperationResultScreenContent
      pictogram="attention"
      title={I18n.t("features.itWallet.walletRevocation.confirmScreen.title")}
      subtitle={I18n.t(
        "features.itWallet.walletRevocation.confirmScreen.subtitle"
      )}
      action={{
        label: I18n.t(
          "features.itWallet.walletRevocation.confirmScreen.action"
        ),
        accessibilityLabel: I18n.t(
          "features.itWallet.walletRevocation.confirmScreen.action"
        ),
        onPress: handleRevokeWalletInstance
      }}
      secondaryAction={{
        label: I18n.t("global.buttons.cancel"),
        accessibilityLabel: I18n.t("global.buttons.cancel"),
        onPress: () => machineRef.send({ type: "close" })
      }}
    />
  );
};
