import { ActionArgs } from "xstate";
import { pipe } from "fp-ts/lib/function";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import * as S from "fp-ts/lib/string";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import { ITW_REMOTE_ROUTES } from "../navigation/routes.ts";
import { ITW_ROUTES } from "../../../navigation/routes.ts";
import ROUTES from "../../../../../navigation/routes.ts";
import { trackItwRemoteDataShare } from "../analytics";
import { groupCredentialsByPurpose } from "../utils/itwRemotePresentationUtils";
import { Context } from "./context";
import { RemoteEvents } from "./events";

export const createRemoteActionsImplementation = (
  navigation: ReturnType<typeof useIONavigation>
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

  trackRemoteDataShare: ({
    context
  }: ActionArgs<Context, RemoteEvents, RemoteEvents>) => {
    if (context.presentationDetails) {
      const { required, optional } = groupCredentialsByPurpose(
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
        request_type
      });
    }
  }
});
