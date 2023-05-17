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

// This is the list of events that we want to track in mixpanel
// The list is not exhaustive, it's just a starting point
// for FCI feature but it can be extended in the future
// to track other initiative
enum FciUxEvent {
  UX = "UX",
  TECH = "TECH",
  KO = "KO"
}

enum FciUxEventCategory {
  ACTION = "action",
  CONTROL = "control",
  EXIT = "exit",
  MICRO_ACTION = "micro_action",
  SCREEN_VIEW = "screen_view"
}

export const trackFciDocOpening = (
  expire_date: SignatureRequestDetailView["expires_at"],
  total_doc_count: number
) =>
  void mixpanelTrack("FCI_DOC_OPENING", {
    expire_date,
    total_doc_count,
    event_type: FciUxEvent.UX,
    event_category: FciUxEventCategory.ACTION
  });

export const trackFciUserExit = (screen_name: string, cta_id?: string) =>
  void mixpanelTrack("FCI_USER_EXIT", {
    screen_name,
    cta_id,
    event_type: FciUxEvent.UX,
    event_category: FciUxEventCategory.EXIT
  });

export const trackFciUxConversion = () =>
  void mixpanelTrack("FCI_UX_CONVERSION", {
    event_type: FciUxEvent.UX,
    event_category: FciUxEventCategory.ACTION
  });

export const trackFciUserDataConfirmed = () =>
  void mixpanelTrack("FCI_USER_DATA_CONFIRMED", {
    event_type: FciUxEvent.UX,
    event_category: FciUxEventCategory.ACTION
  });

export const trackFciDocOpeningSuccess = (
  doc_count: number,
  sign_count: number,
  optional_sign_count: number
) =>
  void mixpanelTrack("FCI_DOC_OPENING_SUCCESS", {
    doc_count,
    sign_count,
    optional_sign_count,
    event_type: FciUxEvent.UX,
    event_category: FciUxEventCategory.CONTROL
  });

export const trackFciSigningDoc = () =>
  void mixpanelTrack("FCI_SIGNING_DOC", {
    event_type: FciUxEvent.UX,
    event_category: FciUxEventCategory.ACTION
  });

export const trackFciShowSignatureFields = () =>
  void mixpanelTrack("FCI_SHOW_SIGNATURE_FIELDS", {
    event_type: FciUxEvent.UX,
    event_category: FciUxEventCategory.MICRO_ACTION
  });

export const trackFciUxSuccess = (
  doc_signed_count: number,
  sign_count: number,
  optional_sign_count: number
) =>
  void mixpanelTrack("FCI_UX_SUCCESS", {
    doc_signed_count,
    sign_count,
    optional_sign_count,
    event_type: FciUxEvent.UX,
    event_category: FciUxEventCategory.SCREEN_VIEW
  });

export const trackFciStartSignature = () =>
  void mixpanelTrack("FCI_START_SIGNATURE", {
    event_type: FciUxEvent.UX,
    event_category: FciUxEventCategory.ACTION
  });

const trackFciAction =
  (mp: NonNullable<typeof mixpanel>) =>
  // eslint-disable-next-line complexity
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
      case getType(fciSigningRequest.success):
      case getType(fciUpdateDocumentSignaturesRequest):
      case getType(fciClearStateRequest):
      case getType(fciPollFilledDocument.request):
      case getType(fciPollFilledDocument.success):
      case getType(fciPollFilledDocument.cancel):
        return mp.track(action.type, { event_type: FciUxEvent.TECH });
      case getType(fciSignatureRequestFromId.failure):
      case getType(fciLoadQtspClauses.failure):
      case getType(fciLoadQtspFilledDocument.failure):
      case getType(fciSigningRequest.failure):
      case getType(fciPollFilledDocument.failure):
        return mp.track(action.type, {
          reason: getNetworkErrorMessage(action.payload),
          event_type: FciUxEvent.KO
        });
    }
    return Promise.resolve();
  };

export default trackFciAction;
