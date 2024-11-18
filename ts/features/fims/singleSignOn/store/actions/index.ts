import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { ConsentData } from "../../types";
import { FimsErrorStateType } from "../reducers";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";

type FimsGetConsentsListRequestType = {
  ctaText: string;
  ctaUrl: string;
};

type FimsGetRedirectUrlAndOpenIABRequestType = {
  acceptUrl?: string;
  serviceId: ServiceId;
};

export const fimsGetConsentsListAction = createAsyncAction(
  "FIMS_GET_CONSENTS_LIST_REQUEST",
  "FIMS_GET_CONSENTS_LIST_SUCCESS",
  "FIMS_GET_CONSENTS_LIST_FAILURE"
)<FimsGetConsentsListRequestType, ConsentData, FimsErrorStateType>();

// note: IAB==InAppBrowser
export const fimsGetRedirectUrlAndOpenIABAction = createAsyncAction(
  "FIMS_GET_REDIRECT_URL_REQUEST",
  "FIMS_GET_REDIRECT_URL_SUCCESS",
  "FIMS_GET_REDIRECT_URL_FAILURE"
)<FimsGetRedirectUrlAndOpenIABRequestType, void, FimsErrorStateType>();

export const fimsCancelOrAbortAction = createStandardAction(
  "FIMS_CANCEL_OR_ABORT"
)<void>();

export type FimsSSOActions =
  | ActionType<typeof fimsGetConsentsListAction>
  | ActionType<typeof fimsGetRedirectUrlAndOpenIABAction>
  | ActionType<typeof fimsCancelOrAbortAction>;
