import { ActionType, createAsyncAction } from "typesafe-actions";
import { CreateFilledDocumentBody } from "../../../../../definitions/fci/CreateFilledDocumentBody";
import { CreateSignatureBody } from "../../../../../definitions/fci/CreateSignatureBody";
import { FilledDocumentDetailView } from "../../../../../definitions/fci/FilledDocumentDetailView";
import { QtspClausesMetadata } from "../../../../../definitions/fci/QtspClausesMetadata";
import { SignatureRequestDetailView } from "../../../../../definitions/fci/SignatureRequestDetailView";
import { NetworkError } from "../../../../utils/errors";

/**
 * get and handle the signatureRequest from id
 */
export const fciSignatureRequestFromId = createAsyncAction(
  "FCI_SIGNATURE_DETAIL_REQUEST",
  "FCI_SIGNATURE_DETAIL_SUCCESS",
  "FCI_SIGNATURE_DETAIL_FAILURE"
)<string, SignatureRequestDetailView, NetworkError>();

/**
 * get and handle the QTSP clauses
 */
export const fciLoadQtspClauses = createAsyncAction(
  "FCI_QTSP_CLAUSES_REQUEST",
  "FCI_QTSP_CLAUSES_SUCCESS",
  "FCI_QTSP_CLAUSES_FAILURE"
)<void, QtspClausesMetadata, NetworkError>();

/**
 * get and handle the QTSP filled document
 */
export const fciLoadQtspFilledDocument = createAsyncAction(
  "FCI_QTSP_FILLED_DOC_REQUEST",
  "FCI_QTSP_FILLED_DOC_SUCCESS",
  "FCI_QTSP_FILLED_DOC_FAILURE"
)<CreateFilledDocumentBody, FilledDocumentDetailView, NetworkError>();

/**
 * post the signature passing a signatureBody
 */
export const fciSigningRequest = createAsyncAction(
  "FCI_SIGNING_REQUEST",
  "FCI_SIGNING_SUCCESS",
  "FCI_SIGNING_FAILURE"
)<CreateSignatureBody, void, NetworkError>();

export type FciActions =
  | ActionType<typeof fciSignatureRequestFromId>
  | ActionType<typeof fciLoadQtspClauses>
  | ActionType<typeof fciLoadQtspFilledDocument>
  | ActionType<typeof fciSigningRequest>;
