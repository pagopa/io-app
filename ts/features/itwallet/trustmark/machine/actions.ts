import { useIOToast } from "@pagopa/io-app-design-system";
import { differenceInSeconds } from "date-fns";
import * as O from "fp-ts/lib/Option";
import { ActionArgs, assign } from "xstate";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { checkCurrentSession } from "../../../../store/actions/authentication";
import { useIOStore } from "../../../../store/hooks";
import { assert } from "../../../../utils/assert";
import { itwCredentialByTypeSelector } from "../../credentials/store/selectors";
import { itwWalletInstanceAttestationStore } from "../../walletInstance/store/actions";
import { itwWalletInstanceAttestationSelector } from "../../walletInstance/store/selectors";
import { Context } from "./context";
import { TrustmarkEvents } from "./events";

export const createItwTrustmarkActionsImplementation = (
  store: ReturnType<typeof useIOStore>,
  navigation: ReturnType<typeof useIONavigation>,
  toast: ReturnType<typeof useIOToast>
) => {
  /**
   * Initializes the trustmark machine
   */
  const onInit = assign<
    Context,
    TrustmarkEvents,
    unknown,
    TrustmarkEvents,
    any
  >(({ context }) => ({
    walletInstanceAttestation: itwWalletInstanceAttestationSelector(
      store.getState()
    ),
    credential: O.toUndefined(
      itwCredentialByTypeSelector(context.credentialType)(store.getState())
    )
  }));

  const storeWalletInstanceAttestation = ({
    context
  }: ActionArgs<Context, TrustmarkEvents, TrustmarkEvents>) => {
    assert(
      context.walletInstanceAttestation,
      "walletInstanceAttestation is undefined"
    );
    store.dispatch(
      itwWalletInstanceAttestationStore(context.walletInstanceAttestation)
    );
  };

  /**
   * Handles the session expired event by dispatching the session expired action and navigating back to the credential details screen
   */
  const handleSessionExpired = () => {
    store.dispatch(checkCurrentSession.success({ isSessionValid: false }));
    navigation.pop();
  };

  /**
   * Shows a failure toast
   */
  const showRetryFailureToast = ({
    context
  }: ActionArgs<Context, TrustmarkEvents, TrustmarkEvents>) => {
    const timeDiffInSeconds = differenceInSeconds(
      new Date(),
      context.nextAttemptAt || new Date()
    );

    toast.error(
      I18n.t("features.itWallet.trustmark.failure.toast", {
        time: timeDiffInSeconds
      })
    );
  };

  return {
    onInit,
    storeWalletInstanceAttestation,
    handleSessionExpired,
    showRetryFailureToast
  };
};
