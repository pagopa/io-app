import { ActionType, createAsyncAction } from "typesafe-actions";
import { NetworkError } from "../../../../../utils/errors";
import { WalletInfo } from "../../../../../../definitions/pagopa/walletv3/WalletInfo";

export const paymentsGetMethodDetailsAction = createAsyncAction(
  "PAYMENTS_GET_METHOD_DETAILS_REQUEST",
  "PAYMENTS_GET_METHOD_DETAILS_SUCCESS",
  "PAYMENTS_GET_METHOD_DETAILS_FAILURE",
  "PAYMENTS_GET_METHOD_DETAILS_CANCEL"
)<{ walletId: string }, WalletInfo, NetworkError, void>();

type DeleteMethodPayload = {
  walletId: string;
  onSuccess?: () => void;
  onFailure?: () => void;
};

export const paymentsDeleteMethodAction = createAsyncAction(
  "PAYMENTS_DELETE_METHOD_REQUEST",
  "PAYMENTS_DELETE_METHOD_SUCCESS",
  "PAYMENTS_DELETE_METHOD_FAILURE",
  "PAYMENTS_DELETE_METHOD_CANCEL"
)<DeleteMethodPayload, void, NetworkError, void>();

type TogglePagoPaCapabilityPayload = {
  walletId: string;
  onSuccess?: () => void;
  onFailure?: () => void;
};

export const paymentsTogglePagoPaCapabilityAction = createAsyncAction(
  "PAYMENTS_TOGGLE_PAGOPA_CAPABILITY_REQUEST",
  "PAYMENTS_TOGGLE_PAGOPA_CAPABILITY_SUCCESS",
  "PAYMENTS_TOGGLE_PAGOPA_CAPABILITY_FAILURE",
  "PAYMENTS_TOGGLE_PAGOPA_CAPABILITY_CANCEL"
)<TogglePagoPaCapabilityPayload, void, NetworkError, void>();

export type PaymentsMethodDetailsActions =
  | ActionType<typeof paymentsGetMethodDetailsAction>
  | ActionType<typeof paymentsDeleteMethodAction>
  | ActionType<typeof paymentsTogglePagoPaCapabilityAction>;
