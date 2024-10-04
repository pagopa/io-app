import { IOToast } from "@pagopa/io-app-design-system";
import { ActionArgs, assertEvent } from "xstate";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { useIODispatch } from "../../../../store/hooks";
import { assert } from "../../../../utils/assert";
import { itwCredentialsStore } from "../../credentials/store/actions";
import { ITW_ROUTES } from "../../navigation/routes";
import { checkCurrentSession } from "../../../../store/actions/authentication";
import { CREDENTIALS_MAP, trackSaveCredentialSuccess } from "../../analytics";
import { Context } from "./context";
import { CredentialIssuanceEvents } from "./events";

export default (
  navigation: ReturnType<typeof useIONavigation>,
  dispatch: ReturnType<typeof useIODispatch>,
  toast: IOToast
) => ({
  navigateToTrustIssuerScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.CREDENTIAL_TRUST_ISSUER
    });
  },

  navigateToCredentialPreviewScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.CREDENTIAL_PREVIEW
    });
  },

  navigateToFailureScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.CREDENTIAL_FAILURE
    });
  },

  navigateToWallet: ({
    context
  }: ActionArgs<
    Context,
    CredentialIssuanceEvents,
    CredentialIssuanceEvents
  >) => {
    toast.success(I18n.t("features.itWallet.issuance.credentialResult.toast"));
    if (context.credentialType) {
      trackSaveCredentialSuccess(CREDENTIALS_MAP[context.credentialType]);
    }
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

  storeCredential: ({
    context
  }: ActionArgs<
    Context,
    CredentialIssuanceEvents,
    CredentialIssuanceEvents
  >) => {
    assert(context.credential, "credential is undefined");

    dispatch(itwCredentialsStore([context.credential]));
  },

  closeIssuance: ({
    event
  }: ActionArgs<
    Context,
    CredentialIssuanceEvents,
    CredentialIssuanceEvents
  >) => {
    assertEvent(event, "close");

    if (event.navigateTo) {
      navigation.replace(...event.navigateTo);
    } else {
      navigation.popToTop();
    }
  },

  handleSessionExpired: () =>
    dispatch(checkCurrentSession.success({ isSessionValid: false }))
});
