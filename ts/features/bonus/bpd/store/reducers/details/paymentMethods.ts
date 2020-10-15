import { fromNullable } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import { IndexedById } from "../../../../../../store/helpers/indexer";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  BpdPaymentMethodActivation,
  bpdPaymentMethodActivation,
  bpdUpdatePaymentMethodActivation,
  HPan
} from "../../actions/paymentMethods";

export type BpdPotPaymentMethodActivation = pot.Pot<
  BpdPaymentMethodActivation,
  Error
>;

export type BpdPaymentMethods = {
  // the value used as key to group the information related to the payment method
  hPan: HPan;
  potTest: pot.Pot<BpdPaymentMethodActivation, Error>;
};

/**
 * Retrieve the existing BpdPaymentMethods (if any) or return a default one
 * @param hPan
 * @param data
 */
const retrieveBpdPaymentMethodEntry = (
  hPan: HPan,
  data: IndexedById<BpdPotPaymentMethodActivation>
): BpdPotPaymentMethodActivation =>
  fromNullable(data[hPan]).getOrElse(pot.none);

/**
 * Update the entry in data with the updated newEntry
 * @param hPan
 * @param data
 * @param newEntry
 */
const updateBpdPaymentMethodEntry = (
  hPan: HPan,
  data: IndexedById<BpdPaymentMethods>,
  newEntry: Partial<BpdPaymentMethods>
): IndexedById<BpdPaymentMethods> => {
  const updatedEntry = {
    ...retrieveBpdPaymentMethodEntry(hPan, data),
    ...newEntry
  };
  return { ...data, [hPan]: updatedEntry };
};

const readPot = (
  hPan: HPan,
  data: IndexedById<BpdPotPaymentMethodActivation>
) => fromNullable(data[hPan]).getOrElse(pot.none);

/**
 * This reducer keep the activation state and the upsert request foreach payment method,
 * grouped by hPan.
 * Foreach hPan there is a {@link BpdPaymentMethods} containing the related state / upsert information.
 * @param state
 * @param action
 */
export const bpdPaymentMethodsReducer = (
  state: IndexedById<BpdPotPaymentMethodActivation> = {},
  action: Action
): IndexedById<BpdPotPaymentMethodActivation> => {
  switch (action.type) {
    case getType(bpdPaymentMethodActivation.request):
      return { ...state, [action.payload]: pot.none };
    case getType(bpdPaymentMethodActivation.success):
      return { ...state, [action.payload.hPan]: pot.some(action.payload) };
    case getType(bpdPaymentMethodActivation.failure):
      return {
        ...state,
        [action.payload.hPan]: pot.toError(
          readPot(action.payload.hPan, state),
          action.payload.error
        )
      };
    case getType(bpdUpdatePaymentMethodActivation.request):
      const updateRequest = readPot(action.payload.hPan, state);
      return {
        ...state,
        [action.payload.hPan]: pot.toUpdating(updateRequest, {
          ...(pot.isSome(updateRequest)
            ? updateRequest.value
            : { hPan: action.payload.hPan }),
          activationStatus: action.payload.value ? "active" : "inactive"
        })
      };
    case getType(bpdUpdatePaymentMethodActivation.success):
      return { ...state, [action.payload.hPan]: pot.some(action.payload) };
    case getType(bpdUpdatePaymentMethodActivation.failure):
      const updateFailure = readPot(action.payload.hPan, state);
      return {
        ...state,
        [action.payload.hPan]: pot.toError(updateFailure, action.payload.error)
      };
  }

  return state;
};

const bpdTestPotValue = (
  state: GlobalState,
  hPan: HPan
): pot.Pot<BpdPaymentMethodActivation, Error> | undefined => {
  console.log("pottttte");
  return state.bonus.bpd.details.paymentMethods[hPan];
};

export const bpdPaymentMethodValueSelector = createSelector(
  [bpdTestPotValue],
  potValue => {
    console.log("read selector pot " + potValue);
    return potValue ?? pot.none;
  }
);
