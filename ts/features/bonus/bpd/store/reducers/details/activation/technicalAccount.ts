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
 * This reducer keeps the latest valid technicalACcount (techincal IBAN) for the user.
 * This value can change when:
 * - The application load the first time the value
 * - The user choose to edit / add a new paymentInstrument and the operation is completed with success.
 * - The user choose to unsubscibe from the cashback
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
        ? remoteUndefined
        : state;
    case getType(bpdLoadActivationStatus.failure):
      return remoteError(action.payload);
  }
  return state;
};

export default technicalAccountReducer;
