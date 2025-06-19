import { type DoneActorEvent, type ActionArgs } from "xstate";
import type { WalletInstanceAttestations } from "../../../common/utils/itwTypesUtils.ts";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import { ITW_REMOTE_ROUTES } from "../navigation/routes.ts";
import { ITW_ROUTES } from "../../../navigation/routes.ts";
import ROUTES from "../../../../../navigation/routes.ts";
import { useIOStore } from "../../../../../store/hooks.ts";
import { itwWalletInstanceAttestationStore } from "../../../walletInstance/store/actions/index.ts";
import { checkCurrentSession } from "../../../../authentication/common/store/actions/index.ts";
import { Context } from "./context.ts";
import { RemoteEvents } from "./events.ts";

export const createRemoteActionsImplementation = (
  navigation: ReturnType<typeof useIONavigation>,
  store: ReturnType<typeof useIOStore>
) => ({
  navigateToFailureScreen: () => {
    navigation.navigate(ITW_REMOTE_ROUTES.MAIN, {
      screen: ITW_REMOTE_ROUTES.FAILURE
    });
  },

  navigateToDiscoveryScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.DISCOVERY.INFO,
      params: {}
    });
  },

  navigateToClaimsDisclosureScreen: () => {
    navigation.navigate(ITW_REMOTE_ROUTES.MAIN, {
      screen: ITW_REMOTE_ROUTES.CLAIMS_DISCLOSURE
    });
  },

  navigateToBarcodeScanScreen: () => {
    navigation.navigate(ROUTES.BARCODE_SCAN);
  },

  navigateToAuthResponseScreen: () => {
    navigation.navigate(ITW_REMOTE_ROUTES.MAIN, {
      screen: ITW_REMOTE_ROUTES.AUTH_RESPONSE
    });
  },

  closePresentation: () => {
    navigation.popToTop();
  },

  storeWalletInstanceAttestation: ({
    event
  }: ActionArgs<Context, RemoteEvents, RemoteEvents>) => {
    store.dispatch(
      itwWalletInstanceAttestationStore(
        (event as DoneActorEvent<WalletInstanceAttestations>).output
      )
    );
  },

  handleSessionExpired: () =>
    store.dispatch(checkCurrentSession.success({ isSessionValid: false }))
});
