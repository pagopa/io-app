import { useCallback } from "react";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent.tsx";
import I18n from "../../../../../i18n.ts";
import { ItwRemoteMachineContext } from "../machine/provider.tsx";

export const ItwRemoteWalletInactiveScreen = () => {
  const machineRef = ItwRemoteMachineContext.useActorRef();

  const handleContinue = useCallback(() => {
    machineRef.send({ type: "accept-tos" });
  }, [machineRef]);

  const handleClose = useCallback(() => {
    machineRef.send({ type: "go-to-wallet" });
  }, [machineRef]);

  return (
    <OperationResultScreenContent
      pictogram={"itWallet"}
      title={I18n.t(
        "features.itWallet.presentation.remote.walletInactiveScreen.title"
      )}
      subtitle={I18n.t(
        "features.itWallet.presentation.remote.walletInactiveScreen.subtitle"
      )}
      action={{
        label: I18n.t(
          "features.itWallet.presentation.remote.walletInactiveScreen.continue"
        ),
        onPress: handleContinue
      }}
      secondaryAction={{
        label: I18n.t(
          "features.itWallet.presentation.remote.walletInactiveScreen.close"
        ),
        onPress: handleClose
      }}
    />
  );
};
