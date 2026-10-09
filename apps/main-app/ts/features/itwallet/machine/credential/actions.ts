import I18n from "i18next";
import { ActionArgs, assertEvent, assign } from "xstate";

import ROUTES from "../../../../navigation/routes";
import { assert } from "../../../../utils/assert";
import { isRouteInNavigationState } from "../../../../utils/navigation";
import { checkCurrentSession } from "../../../authentication/common/store/actions";
import {
  trackSaveCredentialSuccess,
  trackStartAddNewCredential,
  trackStartCredentialUpgrade,
  trackWalletDataShare,
  trackWalletDataShareAccepted
} from "../../analytics";
import { itwMixPanelCredentialDetailsSelector } from "../../analytics/store/selectors";
import { getMixPanelCredential } from "../../analytics/utils";
import { itwClearCredentialUpgradeFailed } from "../../common/store/actions/preferences";
import { itwSetCredentialExitSurvey } from "../../common/store/actions/ui";
import { selectItwSpecsVersion } from "../../common/store/selectors/environment";
import { CredentialMetadata } from "../../common/utils/itwTypesUtils";
import { itwCredentialsReplaceByType } from "../../credentials/store/actions";
import { itwCredentialSelector } from "../../credentials/store/selectors";
import { itwCredentialsCatalogueByTypesSelector } from "../../credentialsCatalogue/store/selectors";
import {
  itwLifecycleIsITWalletValidSelector,
  itwLifecycleIsValidSelector
} from "../../lifecycle/store/selectors";
import { ITW_ROUTES } from "../../navigation/routes";
import {
  itwKeyAttestationsStore,
  itwWalletInstanceAttestationStore
} from "../../walletInstance/store/actions";
import { itwWalletInstanceAttestationSelector } from "../../walletInstance/store/selectors";
import { Context } from "./context";
import { CredentialIssuanceEvents } from "./events";

type CredentialIssuanceActionArgs = ActionArgs<
  Context,
  CredentialIssuanceEvents,
  CredentialIssuanceEvents
>;

/** Initializes the credential issuance machine from the Redux store. */
export const onInitAction = assign<
  Context,
  CredentialIssuanceEvents,
  unknown,
  CredentialIssuanceEvents,
  any
>(({ context }) => {
  const state = context.deps.store.getState();

  return {
    isItWalletValid: itwLifecycleIsITWalletValidSelector(state),
    walletInstanceAttestation: itwWalletInstanceAttestationSelector(state),
    credentialsCatalogue: itwCredentialsCatalogueByTypesSelector(state),
    isWalletValid: itwLifecycleIsValidSelector(state),
    deps: {
      ...context.deps,
      itwVersion: selectItwSpecsVersion(state) // Ensure IT-Wallet version is always updated
    }
  };
});

export const navigateToCredentialIntroductionScreenAction = ({
  context
}: CredentialIssuanceActionArgs) => {
  context.deps.navigation.navigate(ITW_ROUTES.MAIN, {
    screen: ITW_ROUTES.ISSUANCE.CREDENTIAL_INTRODUCTION
  });
};

export const navigateToTrustIssuerScreenAction = ({
  context
}: CredentialIssuanceActionArgs) => {
  context.deps.navigation.navigate(ITW_ROUTES.MAIN, {
    screen: ITW_ROUTES.ISSUANCE.CREDENTIAL_TRUST_ISSUER
  });
};

export const navigateToCredentialPreviewScreenAction = ({
  context
}: CredentialIssuanceActionArgs) => {
  context.deps.navigation.navigate(ITW_ROUTES.MAIN, {
    screen: ITW_ROUTES.ISSUANCE.CREDENTIAL_PREVIEW
  });
};

export const navigateToFailureScreenAction = ({
  context
}: CredentialIssuanceActionArgs) => {
  context.deps.navigation.navigate(ITW_ROUTES.MAIN, {
    screen: ITW_ROUTES.ISSUANCE.CREDENTIAL_FAILURE
  });
};

export const navigateToWalletAction = ({
  context
}: CredentialIssuanceActionArgs) => {
  context.deps.toast.success(
    I18n.t("features.itWallet.issuance.credentialResult.toast")
  );
  context.deps.navigation.popTo(ROUTES.MAIN, {
    screen: ROUTES.WALLET_HOME,
    params: {}
  });
};

export const navigateToEidVerificationExpiredScreenAction = ({
  context
}: CredentialIssuanceActionArgs) => {
  // Resets only the nested ITW stack, keeping the navigator and its machines mounted
  context.deps.navigation.navigate(ITW_ROUTES.MAIN, {
    state: {
      routes: [{ name: ITW_ROUTES.PRESENTATION.EID_VERIFICATION_EXPIRED }]
    }
  });
};

export const navigateToCardOnboardingScreenAction = ({
  context
}: CredentialIssuanceActionArgs) => {
  context.deps.navigation.navigate(ITW_ROUTES.MAIN, {
    screen: context.isItWalletValid
      ? ITW_ROUTES.L3_ONBOARDING
      : ITW_ROUTES.ONBOARDING
  });
};

export const closeIssuanceAction = ({
  context,
  event
}: CredentialIssuanceActionArgs) => {
  const { navigation, store } = context.deps;
  const isWalletInNavigationState = isRouteInNavigationState(
    navigation.getState(),
    ROUTES.WALLET_HOME
  );

  if (!isWalletInNavigationState && navigation.canGoBack()) {
    navigation.goBack();
    return;
  }

  assertEvent(event, "close");
  const { surveyStep, surveyCredential } = event;

  if (surveyStep && surveyCredential) {
    store.dispatch(
      itwSetCredentialExitSurvey({
        step: surveyStep,
        credential: surveyCredential
      })
    );
  }

  navigation.popTo(ROUTES.MAIN, {
    screen: ROUTES.WALLET_HOME,
    params: {}
  });
};

export const storeWalletInstanceAttestationAction = ({
  context
}: CredentialIssuanceActionArgs) => {
  assert(
    context.walletInstanceAttestation,
    "walletInstanceAttestation is undefined"
  );
  context.deps.store.dispatch(
    itwWalletInstanceAttestationStore(context.walletInstanceAttestation)
  );
};

export const storeCredentialAction = ({
  context
}: CredentialIssuanceActionArgs) => {
  assert(context.credentialType, "credentialType is undefined");
  assert(context.credentials, "credentials is undefined");
  const { store } = context.deps;
  const origin = resolveCredentialOrigin(context);
  const credentials = context.credentials.map(bundle => ({
    ...bundle,
    metadata: { ...bundle.metadata, origin }
  }));
  // Removes any credentials with the same type and stores the new ones atomically
  store.dispatch(itwCredentialsReplaceByType(credentials, {}));
  // Clear older upgrade-failed flag for this credential after a successful issuance/upgrade.
  store.dispatch(itwClearCredentialUpgradeFailed(context.credentialType));
  // Stores Key Attestations separately if present
  if (context.keyAttestations) {
    store.dispatch(itwKeyAttestationsStore(context.keyAttestations));
  }
};

/**
 * Resolves how the credential was obtained, for analytics attribution.
 *
 * A credential offer (deeplink/QR code) is the only alternative entry point to
 * the catalogue/list, so its presence in the context marks the third-party
 * channel. Upgrade and reissuance only renew a credential the user already
 * owns, so they keep the channel it was originally obtained from.
 */
const resolveCredentialOrigin = (
  context: Context
): CredentialMetadata["origin"] => {
  if (context.resolvedCredentialOffer) {
    return "credentialOffer";
  }

  if (context.mode !== "issuance" && context.credentialType) {
    const storedCredential = itwCredentialSelector(context.credentialType)(
      context.deps.store.getState()
    );
    return storedCredential?.origin ?? "catalogue";
  }

  return "catalogue";
};

export const trackStartAddCredentialAction = ({
  context
}: CredentialIssuanceActionArgs) => {
  if (context.credentialType) {
    const isItwL3 = itwLifecycleIsITWalletValidSelector(
      context.deps.store.getState()
    );
    const credential = getMixPanelCredential(context.credentialType, isItwL3);
    trackStartAddNewCredential(credential);
  }
};

export const trackAddCredentialAction = ({
  context
}: CredentialIssuanceActionArgs) => {
  if (context.credentialType) {
    const state = context.deps.store.getState();
    const isItwL3 = itwLifecycleIsITWalletValidSelector(state);
    const credential = getMixPanelCredential(context.credentialType, isItwL3);
    trackSaveCredentialSuccess({
      credential,
      credential_details: itwMixPanelCredentialDetailsSelector(state)
    });
  }
};

export const handleSessionExpiredAction = ({
  context
}: CredentialIssuanceActionArgs) =>
  context.deps.store.dispatch(
    checkCurrentSession.success({ isSessionValid: false })
  );

export const trackCredentialIssuingDataShareAction = ({
  context
}: CredentialIssuanceActionArgs) => trackDataShareEvent(context);

export const trackCredentialIssuingDataShareAcceptedAction = ({
  context
}: CredentialIssuanceActionArgs) => trackDataShareEvent(context, true);

export const trackStartCredentialReissuingAction = ({
  context
}: CredentialIssuanceActionArgs) => {
  assert(context.credentialType, "credentialType is undefined");
  trackStartCredentialUpgrade(
    getMixPanelCredential(context.credentialType, context.isItWalletValid)
  );
};

const trackDataShareEvent = (context: Context, isAccepted = false) => {
  if (context.credentialType) {
    const { credentialType } = context;
    if (!credentialType) {
      return;
    }
    const isItwL3 = itwLifecycleIsITWalletValidSelector(
      context.deps.store.getState()
    );
    const credential = getMixPanelCredential(context.credentialType, isItwL3);

    const trackDataFn = isAccepted
      ? trackWalletDataShareAccepted
      : trackWalletDataShare;
    trackDataFn({ credential, phase: "initial_request" });
  }
};
