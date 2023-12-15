import { ActionType, createAsyncAction } from "typesafe-actions";
import { NetworkError } from "../../../../../utils/errors";
import { WalletInfo } from "../../../../../../definitions/pagopa/walletv3/WalletInfo";

export type WalletDetailsGetInstrumentPayload = {
  walletId: string;
};

export type WalletDetailsDeleteinstrumentPayload = {
  walletId: string;
  onSuccess?: (
    action: ActionType<typeof walletDetailsDeleteInstrument.success>
  ) => void;
  onFailure?: (
    action: ActionType<typeof walletDetailsDeleteInstrument.failure>
  ) => void;
};

export const walletDetailsGetInstrument = createAsyncAction(
  "WALLET_DETAILS_GET_INSTRUMENT_REQUEST",
  "WALLET_DETAILS_GET_INSTRUMENT_SUCCESS",
  "WALLET_DETAILS_GET_INSTRUMENT_FAILURE",
  "WALLET_DETAILS_GET_INSTRUMENT_CANCEL"
)<WalletDetailsGetInstrumentPayload, WalletInfo, NetworkError, void>();

export const walletDetailsDeleteInstrument = createAsyncAction(
  "WALLET_DETAILS_DELETE_INSTRUMENT_REQUEST",
  "WALLET_DETAILS_DELETE_INSTRUMENT_SUCCESS",
  "WALLET_DETAILS_DELETE_INSTRUMENT_FAILURE",
  "WALLET_DETAILS_DELETE_INSTRUMENT_CANCEL"
)<WalletDetailsDeleteinstrumentPayload, void, NetworkError, void>();

export type WalletDetailsPagoPaCapabilityTogglePayload = {
  walletId: string;
  onSuccess?: (
    action: ActionType<typeof walletDetailsPagoPaCapabilityToggle.success>
  ) => void;
  onFailure?: (
    action: ActionType<typeof walletDetailsPagoPaCapabilityToggle.failure>
  ) => void;
};

export const walletDetailsPagoPaCapabilityToggle = createAsyncAction(
  "WALLET_DETAILS_PAGOPA_CAPABILITY_TOGGLE_REQUEST",
  "WALLET_DETAILS_PAGOPA_CAPABILITY_TOGGLE_SUCCESS",
  "WALLET_DETAILS_PAGOPA_CAPABILITY_TOGGLE_FAILURE",
  "WALLET_DETAILS_PAGOPA_CAPABILITY_TOGGLE_CANCEL"
)<WalletDetailsPagoPaCapabilityTogglePayload, void, NetworkError, void>();

export type WalletDetailsActions =
  | ActionType<typeof walletDetailsGetInstrument>
  | ActionType<typeof walletDetailsDeleteInstrument>
  | ActionType<typeof walletDetailsPagoPaCapabilityToggle>;
