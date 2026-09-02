import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as S from "fp-ts/lib/string";
import { type ActionArgs, assign, type DoneActorEvent } from "xstate";

import type { WalletInstanceAttestations } from "../../../common/utils/itwTypesUtils.ts";

import ROUTES from "../../../../../navigation/routes.ts";
import { checkCurrentSession } from "../../../../authentication/common/store/actions/index.ts";
import { BATCH_ISSUANCE_CREDENTIALS } from "../../../common/utils/itwCredentialIssuanceUtils.ts";
import {
  getCredentialKeyTags,
  isBatchCredential
} from "../../../common/utils/itwCredentialUtils.ts";
import { itwCredentialsConsumeInstance } from "../../../credentials/store/actions/index.ts";
import {
  itwAllStoredCredentialsSelector,
  itwCredentialsAllSelector
} from "../../../credentials/store/selectors/index.ts";
import { ITW_ROUTES } from "../../../navigation/routes.ts";
import { itwWalletInstanceAttestationStore } from "../../../walletInstance/store/actions/index.ts";
import { itwWalletInstanceAttestationSelector } from "../../../walletInstance/store/selectors/index.ts";
import { trackItwRemoteDataShare } from "../analytics";
import { ITW_REMOTE_ROUTES } from "../navigation/routes.ts";
import {
  getRemoteCredentialCombination,
  groupCredentialsByPurpose
} from "../utils/itwRemotePresentationUtils";
import { Context } from "./context.ts";
import { RemoteEvents } from "./events.ts";

/**
 * Initializes the remote presentation machine from the Redux store.
 */
export const onInitAction = assign<
  Context,
  RemoteEvents,
  unknown,
  RemoteEvents,
  any
>(({ context }) => {
  const state = context.deps.store.getState();

  return {
    walletInstanceAttestation: itwWalletInstanceAttestationSelector(state),
    credentials: itwCredentialsAllSelector(state)
  };
});

export const navigateToFailureScreenAction = ({
  context
}: ActionArgs<Context, RemoteEvents, RemoteEvents>) => {
  context.deps.navigation.navigate(ITW_REMOTE_ROUTES.MAIN, {
    screen: ITW_REMOTE_ROUTES.FAILURE
  });
};

export const navigateToDiscoveryScreenAction = ({
  context
}: ActionArgs<Context, RemoteEvents, RemoteEvents>) => {
  context.deps.navigation.navigate(ITW_ROUTES.MAIN, {
    screen: ITW_ROUTES.DISCOVERY.INFO,
    params: { level: "l3" } // To continue with the presentation, IT-Wallet must be activated
  });
};

export const navigateToClaimsDisclosureScreenAction = ({
  context
}: ActionArgs<Context, RemoteEvents, RemoteEvents>) => {
  context.deps.navigation.navigate(ITW_REMOTE_ROUTES.MAIN, {
    screen: ITW_REMOTE_ROUTES.CLAIMS_DISCLOSURE
  });
};

export const navigateToBarcodeScanScreenAction = ({
  context
}: ActionArgs<Context, RemoteEvents, RemoteEvents>) => {
  context.deps.navigation.navigate(ROUTES.BARCODE_SCAN, undefined);
};

export const navigateToAuthResponseScreenAction = ({
  context
}: ActionArgs<Context, RemoteEvents, RemoteEvents>) => {
  context.deps.navigation.navigate(ITW_REMOTE_ROUTES.MAIN, {
    screen: ITW_REMOTE_ROUTES.AUTH_RESPONSE
  });
};

export const closePresentationAction = ({
  context
}: ActionArgs<Context, RemoteEvents, RemoteEvents>) => {
  context.deps.navigation.popToTop();
};

export const trackRemoteDataShareAction = ({
  context
}: ActionArgs<Context, RemoteEvents, RemoteEvents>) => {
  if (context.presentationDetails) {
    const { required, optional } = groupCredentialsByPurpose(
      context.presentationDetails
    );
    const credential_type = getRemoteCredentialCombination(
      context.presentationDetails
    );
    const requestedCredentials = [...required, ...optional];

    const data_type = optional.length > 0 ? "optional" : "required";

    /**
     * Returns the request type based on the "purpose" fields in the credentials:
     * - "no_purpose" if none are defined
     * - "unique_purpose" if there's only one purpose, or all share the same purpose
     * - "multiple_purpose" if there are multiple distinct valid purposes
     * A purpose is considered valid only if it's a non-empty, non-whitespace string.
     */
    const request_type = pipe(
      requestedCredentials,
      A.map(item => item.purpose),
      A.filterMap(O.fromPredicate(p => !!p?.trim())),
      A.uniq(S.Eq),
      purposes =>
        purposes.length === 0
          ? "no_purpose"
          : purposes.length === 1
            ? "unique_purpose"
            : "multiple_purpose"
    );

    trackItwRemoteDataShare({
      data_type,
      request_type,
      credential_type
    });
  }
};

export const storeWalletInstanceAttestationAction = ({
  context,
  event
}: ActionArgs<Context, RemoteEvents, RemoteEvents>) => {
  context.deps.store.dispatch(
    itwWalletInstanceAttestationStore(
      (event as DoneActorEvent<WalletInstanceAttestations>).output
    )
  );
};

export const consumePresentedBatchCredentialsAction = ({
  context
}: ActionArgs<Context, RemoteEvents, RemoteEvents>) => {
  const credentials = itwAllStoredCredentialsSelector(
    context.deps.store.getState()
  );

  // Restrict consumption to credential types explicitly opted in via
  // `consumeOnPresentation` in BATCH_ISSUANCE_CREDENTIALS (currently only Proof of Age):
  // presenting any other credential, batch or not, has no effect here.
  const consumedInstances = context.presentedKeyTags
    .map(keyTag => {
      const credential = credentials.find(
        c =>
          BATCH_ISSUANCE_CREDENTIALS[c.credentialType]
            ?.consumeOnPresentation === true &&
          isBatchCredential(c) &&
          getCredentialKeyTags(c).includes(keyTag)
      );
      return credential
        ? { credentialId: credential.credentialId, keyTag }
        : undefined;
    })
    .filter(
      (instance): instance is { credentialId: string; keyTag: string } =>
        instance !== undefined
    );

  if (consumedInstances.length > 0) {
    context.deps.store.dispatch(
      itwCredentialsConsumeInstance(consumedInstances)
    );
  }
};

export const handleSessionExpiredAction = ({
  context
}: ActionArgs<Context, RemoteEvents, RemoteEvents>) =>
  context.deps.store.dispatch(
    checkCurrentSession.success({ isSessionValid: false })
  );
