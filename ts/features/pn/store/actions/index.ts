import { ActionType, createAsyncAction } from "typesafe-actions";

export const pnActivationUpsert = createAsyncAction(
  "PN_ACTIVATION_UPSERT_REQUEST",
  "PN_ACTIVATION_UPSERT_SUCCESS",
  "PN_ACTIVATION_UPSERT_FAILURE"
)<boolean, boolean, Error>();

export type PnActions = ActionType<typeof pnActivationUpsert>;
