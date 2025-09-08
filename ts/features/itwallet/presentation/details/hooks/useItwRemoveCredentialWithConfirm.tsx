import { useIOToast } from "@pagopa/io-app-design-system";
import { Alert } from "react-native";
import I18n from "i18next";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOStore } from "../../../../../store/hooks";
import {
  trackCredentialDeleteProperties,
  CREDENTIALS_MAP,
  trackItwCredentialDelete
} from "../../../analytics";
import { StoredCredential } from "../../../common/utils/itwTypesUtils";
import { itwCredentialsRemoveByType } from "../../../credentials/store/actions";

/**
 * Hook that shows a confirmation dialog and, if confirmed, removes a credential from the wallet
 */
export const useItwRemoveCredentialWithConfirm = (
  credential: StoredCredential
) => {
  const dispatch = useIODispatch();
  const store = useIOStore();
  const toast = useIOToast();
  const navigation = useIONavigation();

  const handleRemoveCredential = () => {
    dispatch(itwCredentialsRemoveByType(credential.credentialType));
    toast.success(
      I18n.t("features.itWallet.presentation.credentialDetails.toast.removed")
    );
    void trackCredentialDeleteProperties(
      CREDENTIALS_MAP[credential.credentialType],
      store.getState()
    );

    navigation.pop();
  };

  const confirmAndRemoveCredential = () => {
    trackItwCredentialDelete(CREDENTIALS_MAP[credential.credentialType]);
    return Alert.alert(
      I18n.t(
        "features.itWallet.presentation.credentialDetails.dialogs.remove.title"
      ),
      I18n.t(
        "features.itWallet.presentation.credentialDetails.dialogs.remove.content"
      ),
      [
        {
          text: I18n.t(
            "features.itWallet.presentation.credentialDetails.dialogs.remove.confirm"
          ),
          style: "destructive",
          onPress: handleRemoveCredential
        },
        {
          text: I18n.t("global.buttons.cancel"),
          style: "cancel"
        }
      ]
    );
  };

  return {
    confirmAndRemoveCredential
  };
};
