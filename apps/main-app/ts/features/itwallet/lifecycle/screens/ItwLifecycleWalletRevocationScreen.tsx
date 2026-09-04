import I18n from "i18next";
import { useMemo } from "react";

import { LoadingScreenContent } from "../../../../components/screens/LoadingScreenContent";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useOfflineToastGuard } from "../../../../hooks/useOfflineToastGuard";
import { useIOStore } from "../../../../store/hooks";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import { ItwEidIssuanceMachineContext } from "../../machine/eid/provider";
import { selectIsLoading } from "../../machine/eid/selectors";
import { itwLifecycleIsITWalletValidSelector } from "../store/selectors/index";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";

const RevocationLoadingScreen = () => {
  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();
  const store = useIOStore();

  // During revocation, `isItwL3` turns false so we capture the initial value to prevent the title from flickering.
  const isItwL3 = useMemo(
    () => itwLifecycleIsITWalletValidSelector(store.getState()),
    [store]
  );

  return (
    <LoadingScreenContent
      subtitle={I18n.t(
        "features.itWallet.walletRevocation.loadingScreen.subtitle"
      )}
      title={I18n.t("features.itWallet.walletRevocation.loadingScreen.title", {
        name: isItwL3 ? "IT-Wallet" : "Documenti su IO"
      })}
    />
  );
};

export const ItwLifecycleWalletRevocationScreen = () => {
  const navigation = useIONavigation();
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
      action={{
        label: I18n.t(
          "features.itWallet.walletRevocation.confirmScreen.action"
        ),
        accessibilityLabel: I18n.t(
          "features.itWallet.walletRevocation.confirmScreen.action"
        ),
        onPress: handleRevokeWalletInstance
      }}
      pictogram="attention"
      secondaryAction={{
        label: I18n.t("global.buttons.cancel"),
        accessibilityLabel: I18n.t("global.buttons.cancel"),
        onPress: () => navigation.pop();
      }}
      subtitle={I18n.t(
        "features.itWallet.walletRevocation.confirmScreen.subtitle"
      )}
      title={I18n.t("features.itWallet.walletRevocation.confirmScreen.title")}
    />
  );
};
