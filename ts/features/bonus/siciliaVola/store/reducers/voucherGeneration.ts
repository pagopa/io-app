import { getType } from "typesafe-actions";
import { none, Option } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { Action } from "../../../../../store/actions/types";
import { svGenerateVoucherStart } from "../actions/voucherGeneration";
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

const reducer = (
  state: VoucherGenerationState = INITIAL_STATE,
  action: Action
): VoucherGenerationState => {
  switch (action.type) {
    case getType(svGenerateVoucherStart):
      return INITIAL_STATE;
  }

  return state;
};

export default reducer;
