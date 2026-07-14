import { ListItemAction } from "@io-app/design-system";
import { constVoid } from "fp-ts/function";
import I18n from "i18next";
import { memo } from "react";
import { Alert, View } from "react-native";

import { useOfflineToastGuard } from "../../../../../hooks/useOfflineToastGuard.ts";
import { trackItwStartDeactivation } from "../../../analytics";
import { useNotAvailableToastGuard } from "../../../common/hooks/useNotAvailableToastGuard.ts";
import { CredentialMetadata } from "../../../common/utils/itwTypesUtils";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import { ITW_PRESENTATION_DETAILS_SCREENVIEW_EVENTS } from "../analytics/enum";
import { useItwStartCredentialSupportRequest } from "../hooks/useItwStartCredentialSupportRequest";

type Props = {
  credential: CredentialMetadata;
};

const ItwPresentationPidDetailFooter = ({ credential }: Props) => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const startAndTrackSupportRequest = useOfflineToastGuard(
    useItwStartCredentialSupportRequest(credential)
  );

  const requestAssistanceLabel = I18n.t(
    "features.itWallet.presentation.credentialDetails.actions.requestAssistance"
  );

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
        icon="message"
        label={requestAssistanceLabel}
        onPress={useNotAvailableToastGuard(startAndTrackSupportRequest)}
        variant="primary"
      />
      <ListItemAction
        icon="trashcan"
        label={I18n.t("features.itWallet.presentation.itWalletId.cta.revoke")}
        onPress={handleRevokePress}
        variant="danger"
      />
    </View>
  );
};

const MemoizedItwPresentationPidDetailFooter = memo(
  ItwPresentationPidDetailFooter
);
export { MemoizedItwPresentationPidDetailFooter as ItwPresentationPidDetailFooter };
