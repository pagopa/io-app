import { getType } from "typesafe-actions";
import { mixpanel } from "../../../mixpanel";
import { Action } from "../../../store/actions/types";
import {
  fciLoadQtspClauses,
  fciLoadQtspFilledDocument,
  fciSignatureRequestFromId,
  fciStartRequest,
  fciSigningRequest,
  fciUpdateDocumentSignaturesRequest,
  fciClearStateRequest,
  fciShowSignedDocumentsStartRequest,
  fciShowSignedDocumentsEndRequest,
  fciPollFilledDocument
} from "../store/actions";
import { getNetworkErrorMessage } from "../../../utils/errors";

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
      case getType(fciShowSignedDocumentsStartRequest):
      case getType(fciShowSignedDocumentsEndRequest):
      case getType(fciPollFilledDocument.request):
      case getType(fciPollFilledDocument.cancel):
        return mp.track(action.type);
      case getType(fciSignatureRequestFromId.failure):
      case getType(fciLoadQtspClauses.failure):
      case getType(fciLoadQtspFilledDocument.failure):
      case getType(fciSigningRequest.failure):
      case getType(fciPollFilledDocument.failure):
        return mp.track(action.type, {
          reason: getNetworkErrorMessage(action.payload)
        });
    }
    return Promise.resolve();
  };

export default trackFciAction;
