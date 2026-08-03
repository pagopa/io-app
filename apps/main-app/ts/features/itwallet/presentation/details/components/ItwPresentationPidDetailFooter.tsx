import { ListItemAction } from "@io-app/design-system";
import { constVoid } from "fp-ts/function";
import I18n from "i18next";
import { memo } from "react";
import { Alert, View } from "react-native";

import { useOfflineToastGuard } from "../../../../../hooks/useOfflineToastGuard";
import { trackItwStartDeactivation } from "../../../analytics";
import { useNotAvailableToastGuard } from "../../../common/hooks/useNotAvailableToastGuard.ts";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import { ITW_PRESENTATION_DETAILS_SCREENVIEW_EVENTS } from "../analytics/enum";

const ItwPresentationPidDetailFooter = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  const handleRevokePress = () => {
    trackItwStartDeactivation({
      credential: "ITW_PID",
      screen_name:
        ITW_PRESENTATION_DETAILS_SCREENVIEW_EVENTS.ITW_CREDENTIAL_DETAIL
    });
    Alert.alert(
      I18n.t("features.itWallet.presentation.itWalletId.dialog.revoke.title"),
      I18n.t("features.itWallet.presentation.itWalletId.dialog.revoke.message"),
      [
        {
          text: I18n.t(
            "features.itWallet.presentation.itWalletId.dialog.revoke.cancel"
          ),
          style: "cancel"
        },
        {
          text: I18n.t(
            "features.itWallet.presentation.itWalletId.dialog.revoke.confirm"
          ),
          style: "destructive",
          onPress: () => machineRef.send({ type: "revoke-wallet-instance" })
        }
      ]
    );
  };
  const guardedHandleRevokePress = useOfflineToastGuard(handleRevokePress);

  return (
    <View>
      <ListItemAction
        icon="website"
        label={I18n.t(
          "features.itWallet.presentation.credentialDetails.discoverItWallet"
        )}
        onPress={useNotAvailableToastGuard(constVoid)}
        variant="primary"
      />
      <ListItemAction
        icon="trashcan"
        label={I18n.t("features.itWallet.presentation.itWalletId.cta.revoke")}
        onPress={guardedHandleRevokePress}
        variant="danger"
      />
    </View>
  );
};

const MemoizedItwPresentationPidDetailFooter = memo(
  ItwPresentationPidDetailFooter
);
export { MemoizedItwPresentationPidDetailFooter as ItwPresentationPidDetailFooter };
