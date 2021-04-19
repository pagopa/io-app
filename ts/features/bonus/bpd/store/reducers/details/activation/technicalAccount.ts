import { getType } from "typesafe-actions";
import { createSelector } from "reselect";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../model/RemoteValue";
import { Action } from "../../../../../../../store/actions/types";
import { bpdDeleteUserFromProgram } from "../../../actions/onboarding";
import { bpdLoadActivationStatus } from "../../../actions/details";
import { bpdUpsertIban } from "../../../actions/iban";
import { IbanStatus } from "../../../../saga/networking/patchCitizenIban";
import { GlobalState } from "../../../../../../../store/reducers/types";

/**
 * This reducer keeps the latest valid technicalAccount (technical IBAN) for the user.
 * This value can change when:
 * - The application loads the first time the value
 * - The user chooses to edit / add a new paymentInstrument and the operation is completed with success.
 * - The user chooses to unsubscribe from the cashback
 *
 * If the action `bpdLoadActivationStatus.success` is dispatched after a call to citizen v1 API, so the
 * the technical account data is not available, the state will be remoteUndefined.
 * @param state
 * @param action
 */
const technicalAccountReducer = (
  state: RemoteValue<string | undefined, Error> = remoteUndefined,
  action: Action
): RemoteValue<string | undefined, Error> => {
  switch (action.type) {
    case getType(bpdDeleteUserFromProgram.success):
      return remoteUndefined;
    case getType(bpdLoadActivationStatus.request):
      return remoteLoading;
    case getType(bpdLoadActivationStatus.success):
      return remoteReady(action.payload.technicalAccount);
    // Update the effective value only if the upsert is OK or CANT_VERIFY
    case getType(bpdUpsertIban.success):
      return action.payload.status === IbanStatus.OK ||
        action.payload.status === IbanStatus.CANT_VERIFY
        ? remoteReady(undefined)
        : state;
    case getType(bpdLoadActivationStatus.failure):
      return remoteError(action.payload);
  }
  return state;
};

export default technicalAccountReducer;

/**
 * Returns the technical account string to show to the user if he has one
 * @return {RemoteValue<string | undefined, Error>}
 */
export const bpdTechnicalAccountSelector = createSelector<
  GlobalState,
  RemoteValue<string | undefined, Error>,
  RemoteValue<string | undefined, Error>
>(
  [(state: GlobalState) => state.bonus.bpd.details.activation.technicalAccount],
  technicalAccount => technicalAccount
);
