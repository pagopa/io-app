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
