import { ActionType, createAsyncAction } from "typesafe-actions";
import { NetworkError } from "../../../../../utils/errors";
import { WalletInfo } from "../../../../../../definitions/pagopa/walletv3/WalletInfo";

export type WalletDetailsGetInstrumentPayload = {
  walletId: string;
};

export const walletDetailsGetInstrument = createAsyncAction(
  "WALLET_DETAILS_GET_INSTRUMENT_REQUEST",
  "WALLET_DETAILS_GET_INSTRUMENT_SUCCESS",
  "WALLET_DETAILS_GET_INSTRUMENT_FAILURE",
  "WALLET_DETAILS_GET_INSTRUMENT_CANCEL"
)<WalletDetailsGetInstrumentPayload, WalletInfo, NetworkError, void>();

export type WalletDetailsActions = ActionType<
  typeof walletDetailsGetInstrument
>;
