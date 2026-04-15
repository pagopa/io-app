import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { HttpClientSuccessResponse } from "@pagopa/io-react-native-http-client";
import { Consent } from "../../../../../../definitions/fims_sso/Consent";
import { FimsErrorStateType } from "../reducers";

export type FimsGetConsentsListRequestType = {
  ctaText: string;
  ctaUrl: string;
  ephemeralSessionOniOS: boolean;
};

type FimsAcceptConsentsRequestType = {
  acceptUrl?: string;
};

export const fimsGetConsentsListAction = createAsyncAction(
  "FIMS_GET_CONSENTS_LIST_REQUEST",
  "FIMS_GET_CONSENTS_LIST_SUCCESS",
  "FIMS_GET_CONSENTS_LIST_FAILURE"
)<FimsGetConsentsListRequestType, Consent, FimsErrorStateType>();

// note: IAB==InAppBrowser
export const fimsAcceptConsentsAction = createStandardAction(
  "FIMS_ACCEPT_CONSENTS"
)<FimsAcceptConsentsRequestType>();
export const fimsAcceptConsentsFailureAction = createStandardAction(
  "FIMS_ACCEPT_CONSENTS_FAILURE"
)<FimsErrorStateType>();
export const fimsCancelOrAbortAction = createStandardAction(
  "FIMS_CANCEL_OR_ABORT"
)<void>();

export const fimsSignAndRetrieveInAppBrowserUrlAction = createAsyncAction(
  "FIMS_GET_REDIRECT_URL_REQUEST",
  "FIMS_GET_REDIRECT_URL_SUCCESS",
  "FIMS_GET_REDIRECT_URL_FAILURE"
)<HttpClientSuccessResponse, void, FimsErrorStateType>();

export type FimsSSOActions =
  | ActionType<typeof fimsGetConsentsListAction>
  | ActionType<typeof fimsAcceptConsentsAction>
  | ActionType<typeof fimsAcceptConsentsFailureAction>
  | ActionType<typeof fimsSignAndRetrieveInAppBrowserUrlAction>
  | ActionType<typeof fimsCancelOrAbortAction>;
