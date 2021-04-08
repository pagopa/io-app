import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../model/RemoteValue";
import { Action } from "../../../../../../../store/actions/types";
import { getType } from "typesafe-actions";
import { bpdDeleteUserFromProgram } from "../../../actions/onboarding";
import { bpdLoadActivationStatus } from "../../../actions/details";
import { bpdUpsertIban } from "../../../actions/iban";
import { IbanStatus } from "../../../../saga/networking/patchCitizenIban";

/**
 * This reducer keeps the latest valid technicalAccount (technical IBAN) for the user.
 * This value can change when:
 * - The application load the first time the value
 * - The user choose to edit / add a new paymentInstrument and the operation is completed with success.
 * - The user choose to unsubscribe from the cashback
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
      return action.payload.technicalAccount
        ? remoteReady(action.payload.technicalAccount)
        : remoteUndefined;
    // Update the effective value only if the upsert is OK or CANT_VERIFY
    case getType(bpdUpsertIban.success):
      return action.payload.status === IbanStatus.OK ||
        action.payload.status === IbanStatus.CANT_VERIFY
        ? remoteUndefined
        : state;
    case getType(bpdLoadActivationStatus.failure):
      return remoteError(action.payload);
  }
  return state;
};

export default technicalAccountReducer;
