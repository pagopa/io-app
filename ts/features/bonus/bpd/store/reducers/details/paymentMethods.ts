import { fromNullable } from "fp-ts/lib/Option";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import * as pot from "italia-ts-commons/lib/pot";
import { Action } from "../../../../../../store/actions/types";
import { IndexedById } from "../../../../../../store/helpers/indexer";
import { screenBlackList } from "../../../../../../store/reducers/allowedSnapshotScreens";
import { isDebugModeEnabledSelector } from "../../../../../../store/reducers/debug";
import { plainNavigationCurrentRouteSelector } from "../../../../../../store/reducers/navigation";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../model/RemoteValue";
import {
  BpdPaymentMethodActivation,
  bpdPaymentMethodActivation,
  bpdUpdatePaymentMethodActivation,
  HPan
} from "../../actions/paymentMethods";

export type BpdPaymentMethods = {
  // the value used as key to group the information related to the payment method
  hPan: HPan;
  // represent the effective remote value of bpd activation status on the payment method
  actualValue: RemoteValue<BpdPaymentMethodActivation, Error>;
  // represent the remote request to update the activation status on the payment method
  upsertValue: RemoteValue<null, Error>;
  potTest: pot.Pot<BpdPaymentMethodActivation, Error>;
};

/**
 * Retrieve the existing BpdPaymentMethods (if any) or return a default one
 * @param hPan
 * @param data
 */
const retrieveBpdPaymentMethodEntry = (
  hPan: HPan,
  data: IndexedById<BpdPaymentMethods>
): BpdPaymentMethods =>
  fromNullable(data[hPan]).getOrElse({
    hPan,
    actualValue: remoteUndefined,
    upsertValue: remoteUndefined,
    potTest: pot.none
  });

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
        actualValue: remoteLoading,
        potTest: pot.noneLoading
      });
    case getType(bpdPaymentMethodActivation.success):
      return updateBpdPaymentMethodEntry(action.payload.hPan, state, {
        actualValue: remoteReady(action.payload),
        potTest: pot.some(action.payload)
      });
    case getType(bpdPaymentMethodActivation.failure):
      return updateBpdPaymentMethodEntry(action.payload.hPan, state, {
        actualValue: remoteError(action.payload.error),
        potTest: pot.noneError(action.payload.error)
      });
    case getType(bpdUpdatePaymentMethodActivation.request):
      const currentEntry = retrieveBpdPaymentMethodEntry(
        action.payload.hPan,
        state
      );
      return updateBpdPaymentMethodEntry(action.payload.hPan, state, {
        upsertValue: remoteLoading,
        potTest: pot.toUpdating(currentEntry.potTest, {
          ...currentEntry,
          activationStatus: action.payload.value ? "active" : "inactive"
        })
      });
    case getType(bpdUpdatePaymentMethodActivation.success):
      return updateBpdPaymentMethodEntry(action.payload.hPan, state, {
        actualValue: remoteReady(action.payload),
        upsertValue: remoteReady(null),
        potTest: pot.some(action.payload)
      });
    case getType(bpdUpdatePaymentMethodActivation.failure):
      const currentEntrypick = retrieveBpdPaymentMethodEntry(
        action.payload.hPan,
        state
      );
      return updateBpdPaymentMethodEntry(action.payload.hPan, state, {
        upsertValue: remoteError(action.payload.error),
        potTest: pot.toError(currentEntrypick.potTest, action.payload.error)
      });
  }

  return state;
};

/**
 *
 * @param state
 * @param hPan
 */
const bpdPaymentMethodActualValue = (
  state: GlobalState,
  hPan: HPan
): RemoteValue<BpdPaymentMethodActivation, Error> | undefined => {
  console.log("read");
  return state.bonus.bpd.details.paymentMethods[hPan]?.actualValue;
};

/**
 *
 * @param state
 * @param hPan
 */
const bpdPaymentMethodUpsertValue = (
  state: GlobalState,
  hPan: HPan
): RemoteValue<null, Error> | undefined =>
  state.bonus.bpd.details.paymentMethods[hPan]?.upsertValue;

/**
 *
 */
export const bpdPaymentMethodActualValueSelector = createSelector(
  [bpdPaymentMethodActualValue],
  actualValue => {
    console.log("read selector");
    return actualValue ?? remoteUndefined;
  }
);

/**
 *
 */
export const bpdPaymentMethodUpsertValueSelector = createSelector(
  [bpdPaymentMethodUpsertValue],
  upsertValue => {
    console.log("read selector upsert");
    return upsertValue ?? remoteUndefined;
  }
);
