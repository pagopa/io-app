import { getType } from "typesafe-actions";
import { mixpanelTrack } from "../../../mixpanel";
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
import { buildEventProperties } from "../../../utils/analytics";

export const trackFciSignatureCancelled = () =>
  mixpanelTrack(
    "FCI_SIGNATURE_CANCELLED",
    buildEventProperties("KO", "screen_view")
  );

export const trackFciSignatureExpired = () =>
  mixpanelTrack(
    "FCI_SIGNATURE_EXPIRED",
    buildEventProperties("KO", "screen_view")
  );

export const trackFciDocSignatureInProgress = () =>
  mixpanelTrack(
    "FCI_DOC_SIGNATURE_IN_PROGRESS",
    buildEventProperties("KO", "screen_view")
  );

export const trackFciSignatureRejected = () =>
  mixpanelTrack(
    "FCI_SIGNATURE_REJECTED",
    buildEventProperties("KO", "screen_view")
  );

export const trackFciDocAlreadySigned = () =>
  mixpanelTrack(
    "FCI_DOC_ALREADY_SIGNED",
    buildEventProperties("KO", "screen_view")
  );

export const trackFciSignatureDetailFailureAction = (
  reason: string,
  cta_category: "custom_1" | "custom_2",
  cta_id: string
) =>
  mixpanelTrack(
    "FCI_SIGNATURE_DETAIL_FAILURE_ACTION",
    buildEventProperties("UX", "action", { reason, cta_category, cta_id })
  );

export const trackFciDocOpening = (
  expire_date: SignatureRequestDetailView["expires_at"],
  total_doc_count: number,
  environment: string
) =>
  mixpanelTrack(
    "FCI_DOC_OPENING",
    buildEventProperties("UX", "action", {
      expire_date,
      total_doc_count,
      environment
    })
  );

export const trackFciDocumentsView = () =>
  mixpanelTrack("FCI_DOCUMENTS", buildEventProperties("UX", "screen_view"));

export const trackFciSignatureFieldsView = () =>
  mixpanelTrack(
    "FCI_SIGNATURE_FIELDS",
    buildEventProperties("UX", "screen_view")
  );

export const trackFciUserDataShare = () =>
  mixpanelTrack(
    "FCI_USER_DATA_SHARE",
    buildEventProperties("UX", "screen_view")
  );

export const trackFciChangeEmail = () =>
  mixpanelTrack("FCI_CHANGE_EMAIL", buildEventProperties("UX", "action"));

export const trackFciQtspTos = () =>
  mixpanelTrack("FCI_QTSP_TOS", buildEventProperties("UX", "screen_view"));

export const trackFciTosDocPreview = () =>
  mixpanelTrack(
    "FCI_TOS_DOC_PREVIEW",
    buildEventProperties("UX", "screen_view")
  );

export const trackFciTosDocPreviewFailure = () =>
  mixpanelTrack(
    "FCI_TOS_DOC_PREVIEW_FAILURE",
    buildEventProperties("KO", "screen_view")
  );

export const trackFciTosDocPreviewFailureAction = (
  cta_category: "custom_1" | "custom_2",
  cta_id: string
) =>
  mixpanelTrack(
    "FCI_TOS_DOC_PREVIEW_FAILURE_ACTION",
    buildEventProperties("UX", "action", { cta_category, cta_id })
  );

export const trackFciDocSignatureFailure = (reason: string) =>
  mixpanelTrack(
    "FCI_DOC_SIGNATURE_FAILURE",
    buildEventProperties("KO", "screen_view", { reason })
  );

export const trackFciDocSignatureFailureAction = (
  reason: string,
  cta_category: "custom_1" | "custom_2",
  cta_id: string
) =>
  mixpanelTrack(
    "FCI_DOC_SIGNATURE_FAILURE_ACTION",
    buildEventProperties("UX", "action", { reason, cta_category, cta_id })
  );

export const trackFciUserExit = (
  screen_name: string,
  environment: string,
  cta_id?: string
) =>
  mixpanelTrack(
    "FCI_USER_EXIT",
    buildEventProperties("UX", "exit", {
      screen_name,
      cta_id,
      environment
    })
  );

export const trackFciUxConversion = (environment: string) =>
  mixpanelTrack(
    "FCI_UX_CONVERSION",
    buildEventProperties("UX", "action", {
      environment
    })
  );

export const trackFciUserDataConfirmed = (environment: string) =>
  mixpanelTrack(
    "FCI_USER_DATA_CONFIRMED",
    buildEventProperties("UX", "action", { environment })
  );

export const trackFciDocOpeningSuccess = (
  doc_count: number,
  sign_count: number,
  optional_sign_count: number,
  environment: string
) =>
  mixpanelTrack(
    "FCI_DOC_OPENING_SUCCESS",
    buildEventProperties("UX", "control", {
      doc_count,
      sign_count,
      optional_sign_count,
      environment
    })
  );

export const trackFciSigningDoc = (environment: string) =>
  mixpanelTrack(
    "FCI_SIGNING_DOC",
    buildEventProperties("UX", "action", { environment })
  );

export const trackFciShowSignatureFields = (environment: string) =>
  mixpanelTrack(
    "FCI_SHOW_SIGNATURE_FIELDS",
    buildEventProperties("UX", "micro_action", { environment })
  );

export const trackFciUxSuccess = (
  doc_signed_count: number,
  signed_count: number,
  optional_signed_count: number,
  environment: string
) =>
  mixpanelTrack(
    "FCI_UX_SUCCESS",
    buildEventProperties("UX", "screen_view", {
      doc_signed_count,
      signed_count,
      optional_signed_count,
      environment
    })
  );

export const trackFciStartSignature = (environment: string) =>
  mixpanelTrack(
    "FCI_START_SIGNATURE",
    buildEventProperties("UX", "action", { environment })
  );

export const trackFciBottomsheetMessagePermissionRequest = () =>
  mixpanelTrack(
    "FCI_MESSAGE_PERMISSION_REQUEST",
    buildEventProperties("UX", "screen_view")
  );

export const trackFciBottomsheetMessagePermissionAccepted = () =>
  mixpanelTrack(
    "FCI_MESSAGE_PERMISSION_ACCEPTED",
    buildEventProperties("UX", "action")
  );

export const trackFciBottomsheetMessagePermissionDeclined = () =>
  mixpanelTrack(
    "FCI_MESSAGE_PERMISSION_DECLINED",
    buildEventProperties("UX", "action")
  );

export const trackFciPollingFailureScreenView = () =>
  mixpanelTrack(
    "FCI_POLLING_FAILURE",
    buildEventProperties("KO", "screen_view")
  );

export const trackFciPollingFailureAction = (
  cta_category: "custom_1" | "custom_2",
  cta_id: string
) =>
  mixpanelTrack(
    "FCI_POLLING_FAILURE_ACTION",
    buildEventProperties("UX", "action", { cta_category, cta_id })
  );

const trackFciAction =
  (environment: string) =>
  (action: Action): void => {
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
        return mixpanelTrack(
          action.type,
          buildEventProperties("TECH", undefined, { environment })
        );
      case getType(fciSigningRequest.success):
        return mixpanelTrack(
          action.type,
          buildEventProperties("TECH", "control", { environment })
        );
      case getType(fciSignatureRequestFromId.failure):
      case getType(fciLoadQtspClauses.failure):
      case getType(fciLoadQtspFilledDocument.failure):
      case getType(fciSigningRequest.failure):
      case getType(fciPollFilledDocument.failure):
        return mixpanelTrack(
          action.type,
          buildEventProperties("KO", undefined, {
            reason: getNetworkErrorMessage(action.payload),
            environment
          })
        );
    }
  };

export default trackFciAction;
