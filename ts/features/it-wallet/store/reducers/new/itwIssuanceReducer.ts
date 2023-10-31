/**
 * A reducer for the authentication by CIE
 */
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { Trust } from "@pagopa/io-react-native-wallet/";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { ItWalletError } from "../../../utils/errors/itwErrors";
import {
  itwStartIssuanceFlow,
  itwIssuanceChecks,
  itwConfirmIssuance,
  itwIssuanceUserAuthorization
} from "../../actions/new/itwIssuanceActions";
import { CredentialCatalogDisplay } from "../../../utils/mocks";

export type IssuanceData = {
  credentialType: string;
  issuerUrl: string;
  displayData: CredentialCatalogDisplay;
};

export type IssuanceResultData = {
  issuerName: string;
  credential: string;
  credentialType: string;
  parsedCredential: Record<string, string>;
  schema: {
    credentialSubject: Trust.CredentialIssuerEntityConfiguration["payload"]["metadata"]["openid_credential_issuer"]["credentials_supported"][number]["credential_definition"]["credentialSubject"];
    display: CredentialCatalogDisplay;
  };
};

/**
 * Type of the state managed by the reducer for the issuance flow.
 */
export type ItwIssuanceState = {
  // Informations about the credential to be issued
  issuanceData: O.Option<IssuanceData>;
  //
  checks: pot.Pot<true, ItWalletError>;
  // whether the flof is running or is completed
  executingFlow: pot.Pot<void, ItWalletError>;
  //
  executingAuthorization: pot.Pot<void, ItWalletError>;
  //
  executingObtaining: pot.Pot<IssuanceResultData, ItWalletError>;
};

/**
 * Empty state constant which sets the initial state of the reducer.
 */
const EMPTY_STATE: ItwIssuanceState = {
  issuanceData: O.none,
  checks: pot.none,
  executingFlow: pot.none,
  executingAuthorization: pot.none,
  executingObtaining: pot.none
};

const reducer = (
  state: ItwIssuanceState = EMPTY_STATE,
  action: Action
): ItwIssuanceState => {
  switch (action.type) {
    /**
     * Issuance flow.
     */
    case getType(itwStartIssuanceFlow.request):
      return {
        ...state,
        executingFlow: pot.toLoading(state.executingFlow),
        issuanceData: O.some(action.payload)
      };
    case getType(itwStartIssuanceFlow.success):
    case getType(itwStartIssuanceFlow.cancel): // user cancellation is a valid ending for the flow
      return EMPTY_STATE;
    case getType(itwStartIssuanceFlow.failure):
      return {
        ...state,
        executingFlow: pot.toError(state.executingFlow, action.payload)
      };

    /**
     * Preliminary checks section.
     */
    case getType(itwIssuanceChecks.request):
      return {
        ...state,
        checks: pot.toLoading(state.checks)
      };
    case getType(itwIssuanceChecks.success):
      return {
        ...state,
        checks: pot.some(true)
      };
    case getType(itwIssuanceChecks.failure):
      return {
        ...state,
        checks: pot.toError(state.checks, action.payload)
      };

    /**
     * Authorization phase
     */
    case getType(itwConfirmIssuance):
      return {
        ...state,
        executingAuthorization: pot.toLoading(state.executingAuthorization)
      };

    /**
     * Obtain phase
     */
    case getType(itwIssuanceUserAuthorization.request):
      return {
        ...state,
        executingObtaining: pot.toLoading(state.executingObtaining)
      };
    case getType(itwIssuanceUserAuthorization.success):
      return {
        ...state,
        executingObtaining: pot.some(action.payload)
      };
    case getType(itwIssuanceUserAuthorization.failure):
      return {
        ...state,
        executingObtaining: pot.toError(
          state.executingObtaining,
          action.payload
        )
      };

    default:
      return state;
  }
};

/**
 *
 * @param state
 * @returns
 */

export const itwIssuanceDataSelector = (state: GlobalState) =>
  state.features.itWallet.issuance.issuanceData;

export const itwIssuanceResultDataSelector = (state: GlobalState) =>
  state.features.itWallet.issuance.executingObtaining;

export const itwIssuancePreliminaryChecksSelector = (state: GlobalState) =>
  state.features.itWallet.issuance.checks;

export default reducer;
