import { IOToast } from "@pagopa/io-app-design-system";
import { ActionArgs, assertEvent, assign } from "xstate";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { checkCurrentSession } from "../../../../store/actions/authentication";
import { useIOStore } from "../../../../store/hooks";
import { assert } from "../../../../utils/assert";
import { itwCredentialsStore } from "../../credentials/store/actions";
import { ITW_ROUTES } from "../../navigation/routes";
import { itwWalletInstanceAttestationStore } from "../../walletInstance/store/actions";
import { itwWalletInstanceAttestationSelector } from "../../walletInstance/store/reducers";
import {
  CREDENTIALS_MAP,
  trackAddCredentialProfileAndSuperProperties,
  trackSaveCredentialSuccess
} from "../../analytics";
import { Context } from "./context";
import { CredentialIssuanceEvents } from "./events";

export default (
  navigation: ReturnType<typeof useIONavigation>,
  store: ReturnType<typeof useIOStore>,
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

  navigateToWallet: () => {
    toast.success(I18n.t("features.itWallet.issuance.credentialResult.toast"));
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

  storeWalletInstanceAttestation: ({
    context
  }: ActionArgs<
    Context,
    CredentialIssuanceEvents,
    CredentialIssuanceEvents
  >) => {
    assert(
      context.walletInstanceAttestation,
      "walletInstanceAttestation is undefined"
    );
    store.dispatch(
      itwWalletInstanceAttestationStore(context.walletInstanceAttestation)
    );
  },

  storeCredential: ({
    context
  }: ActionArgs<
    Context,
    CredentialIssuanceEvents,
    CredentialIssuanceEvents
  >) => {
    assert(context.credential, "credential is undefined");
    store.dispatch(itwCredentialsStore([context.credential]));
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

  trackAddCredential: ({
    context
  }: ActionArgs<
    Context,
    CredentialIssuanceEvents,
    CredentialIssuanceEvents
  >) => {
    if (context.credentialType) {
      const credential = CREDENTIALS_MAP[context.credentialType];
      trackSaveCredentialSuccess(credential);
      trackAddCredentialProfileAndSuperProperties(store.getState(), credential);
    }
  },

  handleSessionExpired: () =>
    store.dispatch(checkCurrentSession.success({ isSessionValid: false })),

  onInit: assign<
    Context,
    CredentialIssuanceEvents,
    unknown,
    CredentialIssuanceEvents,
    any
  >(() => ({
    walletInstanceAttestation: itwWalletInstanceAttestationSelector(
      store.getState()
    )
  }))
});
