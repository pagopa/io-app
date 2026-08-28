import { differenceInSeconds } from "date-fns";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { ActionArgs, assign } from "xstate";

import { assert } from "../../../../utils/assert";
import { checkCurrentSession } from "../../../authentication/common/store/actions";
import { trackItwTrustmarkRenewFailure } from "../../analytics";
import { getMixPanelCredential } from "../../analytics/utils";
import { itwCredentialSelector } from "../../credentials/store/selectors";
import { itwWalletInstanceAttestationStore } from "../../walletInstance/store/actions";
import { itwWalletInstanceAttestationSelector } from "../../walletInstance/store/selectors";
import { Context } from "./context";
import { TrustmarkEvents } from "./events";

/**
 * Initializes the trustmark machine from the Redux store.
 */
export const onInitAction = assign<
  Context,
  TrustmarkEvents,
  unknown,
  TrustmarkEvents,
  any
>(({ context }) => {
  const { store } = context.deps;
  return {
    walletInstanceAttestation: itwWalletInstanceAttestationSelector(
      store.getState()
    ),
    credential: O.toUndefined(
      itwCredentialSelector(context.credentialType)(store.getState())
    )
  };
});

export const storeWalletInstanceAttestationAction = ({
  context
}: ActionArgs<Context, TrustmarkEvents, TrustmarkEvents>) => {
  assert(
    context.walletInstanceAttestation,
    "walletInstanceAttestation is undefined"
  );
  context.deps.store.dispatch(
    itwWalletInstanceAttestationStore(context.walletInstanceAttestation)
  );
};

/**
 * Handles the session expired event by dispatching the session expired action and navigating back to the credential details screen
 */
export const handleSessionExpiredAction = ({
  context
}: ActionArgs<Context, TrustmarkEvents, TrustmarkEvents>) => {
  context.deps.store.dispatch(
    checkCurrentSession.success({ isSessionValid: false })
  );
  context.deps.navigation.pop();
};

/**
 * Shows a failure toast
 */
export const showRetryFailureToastAction = ({
  context
}: ActionArgs<Context, TrustmarkEvents, TrustmarkEvents>) => {
  const timeDiffInSeconds = differenceInSeconds(
    context.nextAttemptAt || new Date(),
    new Date()
  );

  const time =
    timeDiffInSeconds > 60
      ? Math.ceil(timeDiffInSeconds / 60)
      : timeDiffInSeconds;

  const timeString = I18n.t(
    timeDiffInSeconds > 60 ? "date.time.minutes" : "date.time.seconds",
    {
      count: time
    }
  );

  context.deps.toast.error(
    I18n.t("features.itWallet.trustmark.failure.toast", {
      time: timeString
    })
  );
};

export const trackTrustmarkFailureAction = ({
  context
}: ActionArgs<Context, TrustmarkEvents, TrustmarkEvents>) => {
  trackItwTrustmarkRenewFailure(
    getMixPanelCredential(context.credentialType, false)
  );
};
