import { Alert, View } from "react-native";
import { ListItemAction } from "@pagopa/io-app-design-system";
import { memo } from "react";
import I18n from "i18next";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import { openNotAvailableToast } from "../../../common/utils/itwToastUtils.ts";

const POWERED_BY_IT_WALLET = "Powered by IT-Wallet";

const ItwPresentationPidDetailFooter = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  const requestAssistanceLabel = I18n.t(
    "features.itWallet.presentation.credentialDetails.actions.requestAssistance"
  );

  const handleRevokePress = () => {
    Alert.alert(
      I18n.t("features.itWallet.presentation.itWalletId.dialog.revoke.title"),
      I18n.t("features.itWallet.presentation.itWalletId.dialog.revoke.message"),
      [
        {
          text: I18n.t(
            "features.itWallet.presentation.itWalletId.dialog.revoke.confirm"
          ),
          style: "destructive",
          onPress: () => machineRef.send({ type: "revoke-wallet-instance" })
        },
        {
          text: I18n.t(
            "features.itWallet.presentation.itWalletId.dialog.revoke.cancel"
          ),
          style: "cancel"
        }
      ]
    );
  };

  return (
    <View>
      <ListItemAction
        variant="primary"
        icon="message"
        label={requestAssistanceLabel}
        accessibilityLabel={requestAssistanceLabel}
        onPress={openNotAvailableToast}
      />
      <ListItemAction
        variant="primary"
        icon="website"
        label={POWERED_BY_IT_WALLET}
        accessibilityLabel={POWERED_BY_IT_WALLET}
        onPress={openNotAvailableToast}
      />
      <ListItemAction
        variant="danger"
        icon="trashcan"
        label={I18n.t("features.itWallet.presentation.itWalletId.cta.revoke")}
        accessibilityLabel={I18n.t(
          "features.itWallet.presentation.itWalletId.cta.revoke"
        )}
        onPress={handleRevokePress}
      />
    </View>
  );
};

const MemoizedItwPresentationPidDetailFooter = memo(
  ItwPresentationPidDetailFooter
);
export { MemoizedItwPresentationPidDetailFooter as ItwPresentationPidDetailFooter };
