/**
 * A reducer for the authentication by CIE
 */
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { ItWalletError } from "../../../utils/errors/itwErrors";
import {
  itwStartIssuanceFlow,
  itwIssuanceChecks,
  itwConfirmIssuance
} from "../../actions/new/itwIssuanceActions";
import { CredentialCatalogDisplay } from "../../../utils/mocks";

export type IssuanceData = {
  credentialType: string;
  issuerUrl: string;
  displayData: CredentialCatalogDisplay;
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
};

/**
 * Empty state constant which sets the initial state of the reducer.
 */
const EMPTY_STATE: ItwIssuanceState = {
  issuanceData: O.none,
  checks: pot.none,
  executingFlow: pot.none,
  executingAuthorization: pot.none
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

export const itwIssuancePreliminaryChecksSelector = (state: GlobalState) =>
  state.features.itWallet.issuance.checks;

export default reducer;
