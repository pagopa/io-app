import { getType } from "typesafe-actions";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../bpd/model/RemoteValue";
import { NetworkError } from "../../../../../utils/errors";
import {
  CdcBonusRequestList,
  CdcBonusRequestResponse,
  CdcSelectedBonusList
} from "../../types/CdcBonusRequest";
import { Action } from "../../../../../store/actions/types";
import {
  cdcEnrollUserToBonus,
  cdcRequestBonusList,
  cdcSelectedBonus
} from "../actions/cdcBonusRequest";
import { GlobalState } from "../../../../../store/reducers/types";

export type CdcBonusRequestState = {
  bonusList: RemoteValue<CdcBonusRequestList, NetworkError>;
  selectedBonus?: CdcSelectedBonusList;
  enrolledBonus: RemoteValue<CdcBonusRequestResponse, NetworkError>;
};

const INITIAL_STATE: CdcBonusRequestState = {
  bonusList: remoteUndefined,
  enrolledBonus: remoteUndefined
};

const reducer = (
  state: CdcBonusRequestState = INITIAL_STATE,
  action: Action
): CdcBonusRequestState => {
  switch (action.type) {
    case getType(cdcRequestBonusList.request):
      return {
        ...state,
        bonusList: remoteLoading,
        enrolledBonus: INITIAL_STATE.enrolledBonus
      };
    case getType(cdcRequestBonusList.success):
      return { ...state, bonusList: remoteReady(action.payload) };
    case getType(cdcRequestBonusList.failure):
      return { ...state, bonusList: remoteError(action.payload) };
    case getType(cdcEnrollUserToBonus.request):
      return {
        ...state,
        bonusList: INITIAL_STATE.bonusList,
        enrolledBonus: remoteLoading
      };
    case getType(cdcEnrollUserToBonus.success):
      return {
        ...state,
        enrolledBonus: remoteReady(action.payload)
      };
    case getType(cdcEnrollUserToBonus.failure):
      return {
        ...state,
        enrolledBonus: remoteError(action.payload)
      };
    case getType(cdcSelectedBonus):
      return { ...state, selectedBonus: action.payload };
  }
  return state;
};

export default reducer;

// Selectors
export const cdcSelectedBonusSelector = (
  state: GlobalState
): CdcSelectedBonusList | undefined =>
  state.bonus.cdc.bonusRequest.selectedBonus;

export const cdcBonusRequestListSelector = (
  state: GlobalState
): RemoteValue<CdcBonusRequestList, NetworkError> =>
  state.bonus.cdc.bonusRequest.bonusList;

export const cdcEnrollUserToBonusSelector = (
  state: GlobalState
): RemoteValue<CdcBonusRequestResponse, NetworkError> =>
  state.bonus.cdc.bonusRequest.enrolledBonus;
