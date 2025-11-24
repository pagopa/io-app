import { ListItemAction } from "@pagopa/io-app-design-system";
import { constVoid } from "fp-ts/function";
import I18n from "i18next";
import { memo } from "react";
import { Alert, View } from "react-native";
import { trackWalletStartDeactivation } from "../../../analytics";
import { useNotAvailableToastGuard } from "../../../common/hooks/useNotAvailableToastGuard.ts";
import { StoredCredential } from "../../../common/utils/itwTypesUtils";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import { useItwStartCredentialSupportRequest } from "../hooks/useItwStartCredentialSupportRequest";

type Props = {
  credential: StoredCredential;
};

const ItwPresentationPidDetailFooter = ({ credential }: Props) => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const startAndTrackSupportRequest =
    useItwStartCredentialSupportRequest(credential);

  const requestAssistanceLabel = I18n.t(
    "features.itWallet.presentation.credentialDetails.actions.requestAssistance"
  );

  const handleRevokePress = () => {
    trackWalletStartDeactivation("ITW_PID");
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
        variant="primary"
        icon="website"
        label={I18n.t(
          "features.itWallet.presentation.credentialDetails.discoverItWallet"
        )}
        onPress={useNotAvailableToastGuard(constVoid)}
      />
      <ListItemAction
        variant="primary"
        icon="message"
        label={requestAssistanceLabel}
        onPress={useNotAvailableToastGuard(startAndTrackSupportRequest)}
      />
      <ListItemAction
        variant="danger"
        icon="trashcan"
        label={I18n.t("features.itWallet.presentation.itWalletId.cta.revoke")}
        onPress={handleRevokePress}
      />
    </View>
  );
};

const MemoizedItwPresentationPidDetailFooter = memo(
  ItwPresentationPidDetailFooter
);
export { MemoizedItwPresentationPidDetailFooter as ItwPresentationPidDetailFooter };
