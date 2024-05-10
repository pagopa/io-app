import { ActionType, createAction, createAsyncAction } from "typesafe-actions";

export const fimsGetConsentsListAction = createAsyncAction(
  "FIMS_GET_CONSENTS_LIST_REQUEST",
  "FIMS_GET_CONSENTS_LIST_SUCCESS",
  "FIMS_GET_CONSENTS_LIST_FAILURE"
)<{ ctaUrl: string }, any, Error>();

export const fimsGetRedirectUrlAndOpenBrowserAction = createAsyncAction(
  "FIMS_GET_REDIRECT_URL_REQUEST",
  "FIMS_GET_REDIRECT_URL_SUCCESS",
  "FIMS_GET_REDIRECT_URL_FAILURE"
)();

export type FimsActions =
  | ActionType<typeof fimsGetConsentsListAction>
  | ActionType<typeof fimsGetRedirectUrlAndOpenBrowserAction>;
