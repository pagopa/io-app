import { useIOToast } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { Alert } from "react-native";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { getMixPanelCredential } from "../../../analytics/utils";
import { CredentialMetadata } from "../../../common/utils/itwTypesUtils";
import { itwCredentialsRemoveByType } from "../../../credentials/store/actions";
import { itwLifecycleIsITWalletValidSelector } from "../../../lifecycle/store/selectors";
import { trackItwCredentialDelete } from "../analytics";

/**
 * Hook that shows a confirmation dialog and, if confirmed, removes a credential from the wallet
 */
export const useItwRemoveCredentialWithConfirm = (
  credential: CredentialMetadata
) => {
  const dispatch = useIODispatch();
  const toast = useIOToast();
  const navigation = useIONavigation();
  const isItwL3 = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const mixpanelCredential = getMixPanelCredential(
    credential.credentialType,
    isItwL3
  );

  const handleRemoveCredential = () => {
    dispatch(itwCredentialsRemoveByType(credential.credentialType));
    toast.success(
      I18n.t("features.itWallet.presentation.credentialDetails.toast.removed")
    );
    navigation.pop();
  };

  const confirmAndRemoveCredential = () => {
    trackItwCredentialDelete(mixpanelCredential);
    return Alert.alert(
      I18n.t(
        "features.itWallet.presentation.credentialDetails.dialogs.remove.title"
      ),
      I18n.t(
        "features.itWallet.presentation.credentialDetails.dialogs.remove.content"
      ),
      [
        {
          text: I18n.t("global.buttons.cancel"),
          style: "cancel"
        },
        {
          text: I18n.t(
            "features.itWallet.presentation.credentialDetails.dialogs.remove.confirm"
          ),
          style: "destructive",
          onPress: handleRemoveCredential
        }
      ]
    );
  };

  return {
    confirmAndRemoveCredential
  };
};
