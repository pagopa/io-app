import { getType } from "typesafe-actions";
import { none, Option, some } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { Action } from "../../../../../store/actions/types";
import {
  svGenerateVoucherSelectCategory,
  svGenerateVoucherStart,
  svGenerateVoucherSubThresholdIncome
} from "../actions/voucherGeneration";
import {
  AvailableDestination,
  VoucherRequest
} from "../../types/SvVoucherRequest";
import { IndexedById } from "../../../../../store/helpers/indexer";
import { SvVoucherGeneratedResponse } from "../../types/svVoucherResponse";

export type VoucherGenerationState = {
  voucherRequest: Option<VoucherRequest>;
  voucherGenerated: pot.Pot<SvVoucherGeneratedResponse, Error>;
  availableDestination: pot.Pot<AvailableDestination, Error>;
  availableState: pot.Pot<IndexedById<string>, Error>;
  availableRegion: pot.Pot<IndexedById<string>, Error>;
  availableProvince: pot.Pot<IndexedById<string>, Error>;
  availableMunicipality: pot.Pot<IndexedById<string>, Error>;
};

const INITIAL_STATE: VoucherGenerationState = {
  voucherRequest: none,
  voucherGenerated: pot.none,
  availableDestination: pot.none,
  availableState: pot.none,
  availableRegion: pot.none,
  availableProvince: pot.none,
  availableMunicipality: pot.none
};

const updateSubThresholdIncome = (
  state: Option<VoucherRequest>,
  subThresholdIncome: boolean
): Option<VoucherRequest> =>
  state.fold(state, vR => {
    if (vR.category === "worker" || vR.category === "sick") {
      return some({ ...vR, subThresholdIncome: subThresholdIncome });
    }
    return state;
  });

const reducer = (
  state: VoucherGenerationState = INITIAL_STATE,
  action: Action
): VoucherGenerationState => {
  switch (action.type) {
    case getType(svGenerateVoucherStart):
      return INITIAL_STATE;
    case getType(svGenerateVoucherSelectCategory):
      return {
        ...state,
        voucherRequest: some({
          category: action.payload
        })
      };
    case getType(svGenerateVoucherSubThresholdIncome):
      return {
        ...state,
        voucherRequest: updateSubThresholdIncome(
          state.voucherRequest,
          action.payload
        )
      };
  }

  return state;
};

export default reducer;
