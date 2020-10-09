import { fromNullable } from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import { IndexedById } from "../../../../../../store/helpers/indexer";
import {
  remoteLoading,
  remoteUndefined,
  RemoteValue
} from "../../../model/RemoteValue";
import { bpdPaymentMethodActivation } from "../../actions/paymentMethods";

enum EBpdActivationStatus {
  // bpd is active on the payment method
  ACTIVE = "ACTIVE",
  // bpd is not active on the payment method
  INACTIVE = "INACTIVE",
  // bpd activate on the payment method by someone else, cannot be activated
  NOT_ACTIVABLE = "NOT_ACTIVABLE"
}

type BpdActivationStatus = {
  status: EBpdActivationStatus;
  activationDate: Date;
  deactivationDate: Date;
};

export type BpdPaymentMethods = {
  // the value used as key to group the information related to the payment method
  hPan: string;
  // represent the effective remote value of bpd activation status on the payment method
  actualValue: RemoteValue<Error, BpdActivationStatus>;
  // represent the remote request to update the activation status on the payment method
  upsertValue: RemoteValue<Error, void>;
};

const readBpdPaymentMethodEntry = (
  hPan: string,
  data: IndexedById<BpdPaymentMethods>
): BpdPaymentMethods =>
  fromNullable(data[hPan]).getOrElse({
    hPan,
    actualValue: remoteUndefined,
    upsertValue: remoteUndefined
  });

export const bpdPaymentMethodsReducer = (
  state: IndexedById<BpdPaymentMethods> = {},
  action: Action
): IndexedById<BpdPaymentMethods> => {
  switch (action.type) {
    case getType(bpdPaymentMethodActivation.request): {
      const entry = {
        ...readBpdPaymentMethodEntry(action.payload, state),
        actualValue: remoteLoading
      };
      return { ...state, [action.payload]: entry };
    }
  }

  return state;
};
