import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { CreateSignatureBody } from "../../../../../definitions/fci/CreateSignatureBody";
import { Action } from "../../../../store/actions/types";
import { fciAbortingRequest, fciCreateSignatureBody } from "../actions";

export type FciCreateSignatureRequestState = pot.Pot<
  CreateSignatureBody,
  Error
>;

const emptyState: FciCreateSignatureRequestState = pot.none;

const reducer = (
  state: FciCreateSignatureRequestState = emptyState,
  action: Action
): FciCreateSignatureRequestState => {
  switch (action.type) {
    case getType(fciCreateSignatureBody):
      return pot.some(action.payload);
    case getType(fciAbortingRequest):
      return emptyState;
  }

  return state;
};

export default reducer;
