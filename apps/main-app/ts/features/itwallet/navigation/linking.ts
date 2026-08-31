import { PathConfigMap } from "@react-navigation/native";

import { AppParamsList } from "../../../navigation/params/AppParamsList.ts";
import { ITW_CREDENTIAL_OFFER_LINKING_PATH } from "../offer/utils/index.ts";
import { ITW_REMOTE_ROUTES } from "../presentation/remote/navigation/routes.ts";
import { ITW_ROUTES } from "./routes.ts";

const safeDecodeURIComponent = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

/**
 * Static linking options for internal navigation routes for the IT Wallet. This
 * configuration does not conditionally enable or disable routes based on wallet
 * status or lifecycle.
 */
export const itwLinkingOptions: PathConfigMap<AppParamsList> = {
  [ITW_ROUTES.MAIN]: {
    path: "itw",
    screens: {
      /**
       * Handles https://continua.io.pagopa.it/itw/discovery/info
       *
       * Redirects to the discovery info screen to start the wallet activation
       * flow.
       */
      [ITW_ROUTES.LANDING.DISCOVERY]: {
        path: "discovery/info"
      },

      /**
       * Handles
       * https://continua.io.pagopa.it/itw/credential/issuance/:credentialType
       *
       * Redirects to the credential issuance flow for the given credential
       * type.
       */
      [ITW_ROUTES.LANDING.CREDENTIAL_ISSUANCE]: {
        path: "credential/issuance/:credentialType"
      },

      /**
       * Handles https://continua.io.pagopa.it/itw/credential/reissuance/eid
       *
       * Redirects to the PID reissuance flow
       */
      [ITW_ROUTES.LANDING.EID_REISSUANCE]: {
        path: "credential/reissuance/eid"
      },

      /**
       * Handles https://continua.io.pagopa.it/itw/credential/issuance
       *
       * @deprecated async flow is in maintenance mode and will be discontinued
       */
      [ITW_ROUTES.LANDING.CREDENTIAL_ASYNC_FLOW_CONTINUATION]: {
        path: "credential/issuance"
      },

      /**
       * Handles
       * https://continua.io.pagopa.it/itw/presentation/credential-detail/:credentialType
       *
       * Opens the credential detail screen for the given credential type.
       */
      [ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL]: {
        path: "presentation/credential-detail/:credentialType"
      },
      /**
       * Handles
       * [https://continua.io.pagopa.it/itw/credential-offer?itwCredentialOfferUri=](https://continua.io.pagopa.it/itw/credential-offer?itwCredentialOfferUri=)...
       *
       * Starts the credential offer issuance flow from an external link.
       */
      [ITW_ROUTES.ISSUANCE.CREDENTIAL_OFFER_INTRO]: {
        path: ITW_CREDENTIAL_OFFER_LINKING_PATH,
        parse: {
          itwCredentialOfferUri: safeDecodeURIComponent
        }
      }
    }
  },
  [ITW_REMOTE_ROUTES.MAIN]: {
    path: "itw/auth",
    screens: {
      /**
       * Handles https://continua.io.pagopa.it/itw/auth/request-validation
       *
       * Opens the remote request validation screen
       */
      [ITW_REMOTE_ROUTES.REQUEST_VALIDATION]: {
        path: "request-validation"
      }
    }
  }
};

/**
 * React Navigation linking configuration shared by the root navigator and ITW
 * deep-link handling.
 */
export const itwLinkingConfig = { screens: itwLinkingOptions };
