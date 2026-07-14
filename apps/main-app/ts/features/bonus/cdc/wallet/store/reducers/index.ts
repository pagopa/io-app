import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";

import { CitizenStatus } from "../../../../../../../definitions/cdc/CitizenStatus";
import { Action } from "../../../../../../store/actions/types";
import { NetworkError } from "../../../../../../utils/errors";
import { getCdcStatusWallet } from "../actions";

export type CdcWalletState = {
  cdcStatus: pot.Pot<CitizenStatus, NetworkError>;
};

const INITIAL_STATE: CdcWalletState = {
  cdcStatus: pot.noneLoading
};

const cdcWalletReducer = (
  state: CdcWalletState = INITIAL_STATE,
  action: Action
): CdcWalletState => {
  switch (action.type) {
    case getType(getCdcStatusWallet.cancel):
      return {
        ...state,
        cdcStatus: pot.none
      };
    case getType(getCdcStatusWallet.failure):
      return {
        ...state,
        cdcStatus: pot.toError(state.cdcStatus, action.payload)
      };
    case getType(getCdcStatusWallet.request):
      return {
        ...state,
        cdcStatus: pot.toLoading(state.cdcStatus)
      };
    case getType(getCdcStatusWallet.success):
      return {
        ...state,
        cdcStatus: pot.some(action.payload)
      };
  }
  return state;
};

export default cdcWalletReducer;
