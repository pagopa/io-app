import { useIOToast } from "@pagopa/io-app-design-system";
import { Alert } from "react-native";
import I18n from "../../../../../i18n.ts";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../../store/hooks";
import {
  trackCredentialDeleteProperties,
  trackItwCredentialDelete,
  getMixPanelCredential
} from "../../../analytics";
import { StoredCredential } from "../../../common/utils/itwTypesUtils";
import { itwCredentialsRemoveByType } from "../../../credentials/store/actions";
import { itwLifecycleIsITWalletValidSelector } from "../../../lifecycle/store/selectors";

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
    void trackCredentialDeleteProperties(mixpanelCredential, store.getState());

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
