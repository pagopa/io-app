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
  BpdPmActivationStatus,
  bpdUpdatePaymentMethodActivation,
  HPan
} from "../../actions/paymentMethods";

export type BpdPotPaymentMethodActivation = pot.Pot<
  BpdPaymentMethodActivation,
  Error
>;

const readPot = (
  hPan: HPan,
  data: IndexedById<BpdPotPaymentMethodActivation>
): BpdPotPaymentMethodActivation =>
  fromNullable(data[hPan]).getOrElse(pot.none);

export const getPaymentStatus = (value: boolean): BpdPmActivationStatus =>
  value ? "active" : "inactive";

/**
 * This reducer keep the activation state and the upsert request foreach payment method,
 * grouped by hPan.
 * Foreach hPan there is a {@link BpdPotPaymentMethodActivation} containing the related bpd activation information.
 * @param state
 * @param action
 */
export const bpdPaymentMethodsReducer = (
  state: IndexedById<BpdPotPaymentMethodActivation> = {},
  action: Action
): IndexedById<BpdPotPaymentMethodActivation> => {
  switch (action.type) {
    case getType(bpdPaymentMethodActivation.request):
      return { ...state, [action.payload]: pot.noneLoading };
    case getType(bpdPaymentMethodActivation.success):
      return {
        ...state,
        [action.payload.hPan]: pot.some(action.payload)
      };
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
      // write the candidate activationStatus, preserving all the others fields
      return {
        ...state,
        [action.payload.hPan]: pot.toUpdating(updateRequest, {
          ...(pot.isSome(updateRequest)
            ? updateRequest.value
            : { hPan: action.payload.hPan }),
          activationStatus: getPaymentStatus(action.payload.value)
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

/**
 * The raw selection of the bpd activation status for a payment method
 * @param state
 * @param hPan
 */
const bpdPaymentMethodActivationByHPanValue = (
  state: GlobalState,
  hPan: HPan
): pot.Pot<BpdPaymentMethodActivation, Error> | undefined =>
  state.bonus.bpd.details.paymentMethods[hPan];

/**
 * Return the pot representing the bpd activation status for a payment method.
 * It's wrapped with createSelector in order to memoize the value and avoid recalculation
 * when the state change.
 */
export const bpdPaymentMethodValueSelector = createSelector(
  [bpdPaymentMethodActivationByHPanValue],
  potValue => potValue ?? pot.none
);
