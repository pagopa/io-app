import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { ItWalletError } from "../../../utils/itwErrorsUtils";
import {
  itwIssuanceChecks,
  itwIssuanceGetCredential
} from "../../actions/new/itwIssuanceActions";
import { CredentialCatalogDisplay } from "../../../utils/mocks";
import {
  CredentialConfigurationSchema,
  CredentialDefinition,
  IssuerConfiguration
} from "../../../utils/types";
import { StoredCredential } from "../itwCredentialsReducer";

export type IssuanceData = {
  credentialType: string;
  issuerUrl: string;
  displayData: CredentialCatalogDisplay;
  credentialConfigurationSchema: CredentialConfigurationSchema;
  issuerConf: IssuerConfiguration;
} & CredentialDefinition;

/**
 * Type of the state managed by the reducer for the issuance flow.
 */
export type ItwIssuanceState = {
  /**
   * Preliminary checks pot.
   */
  checks: pot.Pot<O.Option<IssuanceData>, ItWalletError>;
  /**
   * Issuance result pot.
   */
  issuanceResult: pot.Pot<O.Option<StoredCredential>, ItWalletError>;
};

/**
 * Empty state constant which sets the initial state of the reducer.
 */
const EMPTY_STATE: ItwIssuanceState = {
  checks: pot.none,
  issuanceResult: pot.none
};

const reducer = (
  state: ItwIssuanceState = EMPTY_STATE,
  action: Action
): ItwIssuanceState => {
  switch (action.type) {
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
        checks: pot.some(O.some(action.payload))
      };
    case getType(itwIssuanceChecks.failure):
      return {
        ...state,
        checks: pot.toError(state.checks, action.payload)
      };

    /**
     * Obtain phase
     */
    case getType(itwIssuanceGetCredential.request):
      return {
        ...state,
        issuanceResult: pot.toLoading(state.issuanceResult)
      };
    case getType(itwIssuanceGetCredential.success):
      return {
        ...state,
        issuanceResult: pot.some(O.some(action.payload))
      };
    case getType(itwIssuanceGetCredential.failure):
      return {
        ...state,
        issuanceResult: pot.toError(state.issuanceResult, action.payload)
      };

    default:
      return state;
  }
};

export const itwIssuanceResultSelector = (state: GlobalState) =>
  state.features.itWallet.issuance.issuanceResult;

export const itwIssuanceResultDataSelector = (state: GlobalState) =>
  pot.getOrElse(
    pot.map(
      state.features.itWallet.issuance.issuanceResult,
      issuanceResultData => issuanceResultData
    ),
    O.none
  );

export const itwIssuanceChecksSelector = (state: GlobalState) =>
  state.features.itWallet.issuance.checks;

export const itwIssuanceChecksDataSelector = (state: GlobalState) =>
  pot.getOrElse(
    pot.map(state.features.itWallet.issuance.checks, checks => checks),
    O.none
  );

export default reducer;
