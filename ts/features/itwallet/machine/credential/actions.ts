/* eslint-disable @typescript-eslint/no-empty-function */
import { useIOToast } from "@pagopa/io-app-design-system";
import { constNull } from "fp-ts/lib/function";
import { Alert } from "react-native";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import * as credentialIssuanceUtils from "../../common/utils/itwCredentialIssuanceUtils";
import { ITW_ROUTES } from "../../navigation/routes";
import ROUTES from "../../../../navigation/routes";

export default (
  navigation: ReturnType<typeof useIONavigation>,
  toast: ReturnType<typeof useIOToast>
) => ({
  navigateToTrustIssuerScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.CREDENTIAL_AUTH
    });
  },

  navigateToCredentialPreviewScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.CREDENTIAL_PREVIEW
    });
  },

  navigateToFailureScreen: () => {
    Alert.alert("Failure 😭");
  },

  navigateToWallet: () => {
    toast.success(I18n.t("features.itWallet.issuance.eidResult.success.toast"));
    navigation.reset({
      index: 1,
      routes: [
        {
          name: ROUTES.MAIN,
          params: {
            screen: ROUTES.WALLET_HOME
          }
        }
      ]
    });
  },

  storeCredential: () => {},

  disposeWallet: () => {
    credentialIssuanceUtils.disposeWallet().then(constNull).catch(constNull);
  },

  closeIssuance: () => {
    navigation.popToTop();
  }
});
