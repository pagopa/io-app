import { getType } from "typesafe-actions";
import { mixpanel, mixpanelTrack } from "../../../mixpanel";
import { Action } from "../../../store/actions/types";
import {
  fciLoadQtspClauses,
  fciLoadQtspFilledDocument,
  fciSignatureRequestFromId,
  fciStartRequest,
  fciSigningRequest,
  fciUpdateDocumentSignaturesRequest,
  fciClearStateRequest,
  fciPollFilledDocument
} from "../store/actions";
import { getNetworkErrorMessage } from "../../../utils/errors";
import { SignatureRequestDetailView } from "../../../../definitions/fci/SignatureRequestDetailView";
import { EnvironmentEnum } from "../../../../definitions/fci/Environment";
import { buildEventProperties } from "./../../../utils/analytics";

export const trackFciDocOpening = (
  expire_date: SignatureRequestDetailView["expires_at"],
  total_doc_count: number,
  env: EnvironmentEnum
) =>
  void mixpanelTrack(
    "NOTIFICATIONS_OPTIN_PREVIEW_STATUS",
    buildEventProperties("UX", "action", {
      expire_date,
      total_doc_count,
      env
    })
  );

export const trackFciUserExit = (
  screen_name: string,
  env: EnvironmentEnum,
  cta_id?: string
) =>
  void mixpanelTrack(
    "FCI_USER_EXIT",
    buildEventProperties("UX", "exit", {
      screen_name,
      cta_id,
      env
    })
  );

export const trackFciUxConversion = (env: EnvironmentEnum) =>
  void mixpanelTrack(
    "FCI_UX_CONVERSION",
    buildEventProperties("UX", "action", {
      env
    })
  );

export const trackFciUserDataConfirmed = (env: EnvironmentEnum) =>
  void mixpanelTrack(
    "FCI_USER_DATA_CONFIRMED",
    buildEventProperties("UX", "action", {
      env
    })
  );

export const trackFciDocOpeningSuccess = (
  doc_count: number,
  sign_count: number,
  optional_sign_count: number,
  env: EnvironmentEnum
) =>
  void mixpanelTrack(
    "FCI_DOC_OPENING_SUCCESS",
    buildEventProperties("UX", "control", {
      doc_count,
      sign_count,
      optional_sign_count,
      env
    })
  );

export const trackFciSigningDoc = (env: EnvironmentEnum) =>
  void mixpanelTrack(
    "FCI_SIGNING_DOC",
    buildEventProperties("UX", "action", {
      env
    })
  );

export const trackFciShowSignatureFields = (env: EnvironmentEnum) =>
  void mixpanelTrack(
    "FCI_SHOW_SIGNATURE_FIELDS",
    buildEventProperties("UX", "micro_action", {
      env
    })
  );

export const trackFciUxSuccess = (
  doc_signed_count: number,
  signed_count: number,
  optional_signed_count: number,
  env: EnvironmentEnum
) =>
  void mixpanelTrack(
    "FCI_UX_SUCCESS",
    buildEventProperties("UX", "screen_view", {
      doc_signed_count,
      signed_count,
      optional_signed_count,
      env
    })
  );

export const trackFciStartSignature = (env: EnvironmentEnum) =>
  void mixpanelTrack(
    "FCI_START_SIGNATURE",
    buildEventProperties("UX", "action", {
      env
    })
  );

const trackFciAction =
  (mp: NonNullable<typeof mixpanel>) =>
  (action: Action): Promise<void> => {
    switch (action.type) {
      case getType(fciStartRequest):
      case getType(fciSignatureRequestFromId.request):
      case getType(fciSignatureRequestFromId.success):
      case getType(fciLoadQtspClauses.request):
      case getType(fciLoadQtspClauses.success):
      case getType(fciLoadQtspFilledDocument.request):
      case getType(fciLoadQtspFilledDocument.success):
      case getType(fciSigningRequest.request):
      case getType(fciUpdateDocumentSignaturesRequest):
      case getType(fciClearStateRequest):
      case getType(fciPollFilledDocument.request):
      case getType(fciPollFilledDocument.success):
      case getType(fciPollFilledDocument.cancel):
        return mp.track(action.type, buildEventProperties("TECH", undefined));
      case getType(fciSigningRequest.success):
        return mp.track(action.type, buildEventProperties("TECH", "control"));
      case getType(fciSignatureRequestFromId.failure):
      case getType(fciLoadQtspClauses.failure):
      case getType(fciLoadQtspFilledDocument.failure):
      case getType(fciSigningRequest.failure):
      case getType(fciPollFilledDocument.failure):
        return mp.track(
          action.type,
          buildEventProperties("KO", undefined, {
            reason: getNetworkErrorMessage(action.payload)
          })
        );
    }
    return Promise.resolve();
  };

export default trackFciAction;
