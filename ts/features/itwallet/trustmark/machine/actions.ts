import * as O from "fp-ts/lib/Option";
import { AnyEventObject, assign } from "xstate";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { checkCurrentSession } from "../../../../store/actions/authentication";
import { useIOStore } from "../../../../store/hooks";
import { itwCredentialByTypeSelector } from "../../credentials/store/selectors";
import { itwWalletInstanceAttestationSelector } from "../../walletInstance/store/reducers";
import { Context } from "./context";

export const createItwTrustmarkActionsImplementation = (
  store: ReturnType<typeof useIOStore>,
  navigation: ReturnType<typeof useIONavigation>
) => {
  /**
   * Initializes the trustmark machine
   */
  const onInit = assign<Context, AnyEventObject, unknown, { type: "" }, any>(
    ({ context }) => ({
      walletInstanceAttestation: itwWalletInstanceAttestationSelector(
        store.getState()
      ),
      credential: O.toUndefined(
        itwCredentialByTypeSelector(context.credentialType)(store.getState())
      )
    })
  );

  /**
   * Handles the session expired event by dispatching the session expired action and navigating back to the credential details screen
   */
  const handleSessionExpired = () => {
    store.dispatch(checkCurrentSession.success({ isSessionValid: false }));
    navigation.pop();
  };

  return { onInit, handleSessionExpired };
};
