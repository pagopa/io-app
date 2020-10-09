import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import { IndexedById } from "../../../../../../store/helpers/indexer";
import { RemoteValue } from "../../../model/RemoteValue";
import { bpdUpsertIban } from "../../actions/iban";
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
  hpan: string;
  // represent the effective remote value of bpd activation status on the payment method
  actualValue: RemoteValue<Error, BpdActivationStatus>;
  // represent the remote request to update the activation status on the payment method
  upsertValue: RemoteValue<Error, void>;
};

export const bpdPaymentMethodsReducer = (
  state: IndexedById<BpdPaymentMethods> = {},
  action: Action
): IndexedById<BpdPaymentMethods> => {
  switch (action.type) {
    case getType(bpdPaymentMethodActivation.request):
      return { ...state };
  }

  return state;
};
