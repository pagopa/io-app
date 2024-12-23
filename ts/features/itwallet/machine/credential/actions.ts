import { IOToast } from "@pagopa/io-app-design-system";
import { ActionArgs, assign } from "xstate";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { checkCurrentSession } from "../../../../store/actions/authentication";
import { useIOStore } from "../../../../store/hooks";
import { assert } from "../../../../utils/assert";
import {
  CREDENTIALS_MAP,
  trackAddCredentialProfileAndSuperProperties,
  trackSaveCredentialSuccess,
  trackStartAddNewCredential
} from "../../analytics";
import {
  itwFlagCredentialAsRequested,
  itwUnflagCredentialAsRequested
} from "../../common/store/actions/preferences";
import { itwCredentialsStore } from "../../credentials/store/actions";
import { ITW_ROUTES } from "../../navigation/routes";
import { itwWalletInstanceAttestationStore } from "../../walletInstance/store/actions";
import { itwWalletInstanceAttestationSelector } from "../../walletInstance/store/reducers";
import { Context } from "./context";
import { CredentialIssuanceEvents } from "./events";

export default (
  navigation: ReturnType<typeof useIONavigation>,
  store: ReturnType<typeof useIOStore>,
  toast: IOToast
) => ({
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
  })),

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

  closeIssuance: () => {
    navigation.popToTop();
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

    let cred = context.credential;

    cred = {
      ...cred,
      jwt: {
        expiration: '2024-12-22T23:59:59Z',
      }
    };

    store.dispatch(itwCredentialsStore([cred]));
  },

  flagCredentialAsRequested: ({
    context
  }: ActionArgs<
    Context,
    CredentialIssuanceEvents,
    CredentialIssuanceEvents
  >) => {
    assert(context.credentialType, "credentialType is undefined");
    store.dispatch(itwFlagCredentialAsRequested(context.credentialType));
  },

  unflagCredentialAsRequested: ({
    context
  }: ActionArgs<
    Context,
    CredentialIssuanceEvents,
    CredentialIssuanceEvents
  >) => {
    assert(context.credentialType, "credentialType is undefined");
    store.dispatch(itwUnflagCredentialAsRequested(context.credentialType));
  },

  trackStartAddCredential: ({
    context
  }: ActionArgs<
    Context,
    CredentialIssuanceEvents,
    CredentialIssuanceEvents
  >) => {
    if (context.credentialType) {
      const credential = CREDENTIALS_MAP[context.credentialType];
      trackStartAddNewCredential(credential);
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
    store.dispatch(checkCurrentSession.success({ isSessionValid: false }))
});
