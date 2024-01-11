import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { ItWalletError } from "../../utils/itwErrorsUtils";
import {
  itwIssuanceCredentialChecks,
  itwIssuanceCredential
} from "../actions/itwIssuanceCredentialActions";
import { CredentialCatalogDisplay } from "../../utils/itwMocksUtils";
import {
  CredentialConfigurationSchema,
  CredentialDefinition,
  IssuerConfiguration,
  StoredCredential
} from "../../utils/itwTypesUtils";

export type ItwIssuanceCredentialData = {
  credentialType: string;
  issuerUrl: string;
  displayData: CredentialCatalogDisplay;
  credentialConfigurationSchema: CredentialConfigurationSchema;
  issuerConf: IssuerConfiguration;
} & CredentialDefinition;

/**
 * Type of the state managed by the reducer for the issuance flow.
 */
export type ItwIssuanceCredentialState = {
  /**
   * Preliminary checks pot.
   */
  checks: pot.Pot<O.Option<ItwIssuanceCredentialData>, ItWalletError>;
  /**
   * Issuance result pot.
   */
  result: pot.Pot<O.Option<StoredCredential>, ItWalletError>;
};

/**
 * Empty state constant which sets the initial state of the reducer.
 */
const EMPTY_STATE: ItwIssuanceCredentialState = {
  checks: pot.none,
  result: pot.none
};

const reducer = (
  state: ItwIssuanceCredentialState = EMPTY_STATE,
  action: Action
): ItwIssuanceCredentialState => {
  switch (action.type) {
    /**
     * Preliminary checks section.
     */
    case getType(itwIssuanceCredentialChecks.request):
      return {
        ...state,
        checks: pot.toLoading(state.checks)
      };
    case getType(itwIssuanceCredentialChecks.success):
      return {
        ...state,
        checks: pot.some(O.some(action.payload))
      };
    case getType(itwIssuanceCredentialChecks.failure):
      return {
        ...state,
        checks: pot.toError(state.checks, action.payload)
      };

    /**
     * Obtain phase
     */
    case getType(itwIssuanceCredential.request):
      return {
        ...state,
        result: pot.toLoading(state.result)
      };
    case getType(itwIssuanceCredential.success):
      return {
        ...state,
        result: pot.some(O.some(action.payload))
      };
    case getType(itwIssuanceCredential.failure):
      return {
        ...state,
        result: pot.toError(state.result, action.payload)
      };

    default:
      return state;
  }
};

export const itwIssuanceCredentialResultSelector = (state: GlobalState) =>
  state.features.itWallet.issuanceCredential.result;

export const itwIssuanceResultDataSelector = (state: GlobalState) =>
  pot.getOrElse(
    pot.map(
      state.features.itWallet.issuanceCredential.result,
      result => result
    ),
    O.none
  );

export const itwIssuanceCredentialChecksSelector = (state: GlobalState) =>
  state.features.itWallet.issuanceCredential.checks;

export const itwIssuanceCredentialChecksValueSelector = (state: GlobalState) =>
  pot.getOrElse(
    pot.map(
      state.features.itWallet.issuanceCredential.checks,
      checks => checks
    ),
    O.none
  );

export default reducer;
