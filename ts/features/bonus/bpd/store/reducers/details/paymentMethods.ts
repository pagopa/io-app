import { fromNullable } from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import { IndexedById } from "../../../../../../store/helpers/indexer";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../model/RemoteValue";
import {
  BpdPaymentMethodActivation,
  bpdPaymentMethodActivation
} from "../../actions/paymentMethods";

export type BpdPaymentMethods = {
  // the value used as key to group the information related to the payment method
  hPan: string;
  // represent the effective remote value of bpd activation status on the payment method
  actualValue: RemoteValue<BpdPaymentMethodActivation, Error>;
  // represent the remote request to update the activation status on the payment method
  upsertValue: RemoteValue<void, Error>;
};

/**
 * Retrieve the existing BpdPaymentMethods (if any) or return a default one
 * @param hPan
 * @param data
 */
const retrieveBpdPaymentMethodEntry = (
  hPan: string,
  data: IndexedById<BpdPaymentMethods>
): BpdPaymentMethods =>
  fromNullable(data[hPan]).getOrElse({
    hPan,
    actualValue: remoteUndefined,
    upsertValue: remoteUndefined
  });

/**
 * Update the entry in data with the updated newEntry
 * @param hPan
 * @param data
 * @param newEntry
 */
const updateBpdPaymentMethodEntry = (
  hPan: string,
  data: IndexedById<BpdPaymentMethods>,
  newEntry: Partial<BpdPaymentMethods>
): IndexedById<BpdPaymentMethods> => {
  const updatedEntry = {
    ...retrieveBpdPaymentMethodEntry(hPan, data),
    ...newEntry
  };
  return { ...data, [hPan]: updatedEntry };
};

/**
 * This reducer keep the activation state and the upsert request foreach payment method,
 * grouped by hPan.
 * Foreach hPan there is a {@link BpdPaymentMethods} containing the related state / upsert information.
 * @param state
 * @param action
 */
export const bpdPaymentMethodsReducer = (
  state: IndexedById<BpdPaymentMethods> = {},
  action: Action
): IndexedById<BpdPaymentMethods> => {
  switch (action.type) {
    case getType(bpdPaymentMethodActivation.request):
      return updateBpdPaymentMethodEntry(action.payload, state, {
        actualValue: remoteLoading
      });
    case getType(bpdPaymentMethodActivation.success):
      return updateBpdPaymentMethodEntry(action.payload.hPan, state, {
        actualValue: remoteReady(action.payload)
      });
    case getType(bpdPaymentMethodActivation.failure):
      return updateBpdPaymentMethodEntry(action.payload.hPan, state, {
        actualValue: remoteError(action.payload.error)
      });
  }

  return state;
};
