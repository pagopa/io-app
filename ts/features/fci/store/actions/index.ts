import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { CreateFilledDocument } from "../../../../../definitions/fci/CreateFilledDocument";
import { CreateSignatureBody } from "../../../../../definitions/fci/CreateSignatureBody";
import { DocumentToSign } from "../../../../../definitions/fci/DocumentToSign";
import { FilledDocumentDetailView } from "../../../../../definitions/fci/FilledDocumentDetailView";
import { QtspClausesMetadataDetailView } from "../../../../../definitions/fci/QtspClausesMetadataDetailView";
import { SignatureDetailView } from "../../../../../definitions/fci/SignatureDetailView";
import { SignatureRequestDetailView } from "../../../../../definitions/fci/SignatureRequestDetailView";
import { NetworkError } from "../../../../utils/errors";
import { Metadata } from "../../../../../definitions/fci/Metadata";

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
)<void, QtspClausesMetadataDetailView, NetworkError>();

/**
 * get and handle the QTSP filled document
 */
export const fciLoadQtspFilledDocument = createAsyncAction(
  "FCI_QTSP_FILLED_DOC_REQUEST",
  "FCI_QTSP_FILLED_DOC_SUCCESS",
  "FCI_QTSP_FILLED_DOC_FAILURE"
)<CreateFilledDocument, FilledDocumentDetailView, NetworkError>();

/**
 * post the signature passing a signatureBody
 */
export const fciSigningRequest = createAsyncAction(
  "FCI_SIGNING_REQUEST",
  "FCI_SIGNING_SUCCESS",
  "FCI_SIGNING_FAILURE"
)<CreateSignatureBody, SignatureDetailView, NetworkError>();

/**
 * asycn action to download file
 */
export const fciDownloadPreview = createAsyncAction(
  "FCI_DOWNLOAD_PREVIEW_REQUEST",
  "FCI_DOWNLOAD_PREVIEW_SUCCESS",
  "FCI_DOWNLOAD_PREVIEW_FAILURE",
  "FCI_DOWNLOAD_PREVIEW_CANCEL"
)<{ url: string }, { path: string }, NetworkError, void>();

export const fciDownloadPreviewClear = createStandardAction(
  "FCI_DOWNLOAD_PREVIEW_CLEAR"
)<{ path: string }>();

/**
 * update documentSignatures
 */
export const fciUpdateDocumentSignaturesRequest = createStandardAction(
  "FCI_UPDATE_DOCUMENT_SIGNATURE"
)<DocumentToSign>();

/**
 * clear the FCI store
 */
export const fciClearStateRequest = createStandardAction(
  "FCI_CLEAR_STATE_REQUEST"
)<void>();

/**
 * start the FCI action
 */
export const fciStartRequest =
  createStandardAction("FCI_START_REQUEST")<void>();

/**
 * start the FCI signing action
 */
export const fciStartSigningRequest = createStandardAction(
  "FCI_START_SIGNING_REQUEST"
)<void>();

/**
 * start the FCI signed start action
 */
export const fciShowSignedDocumentsStartRequest = createStandardAction(
  "FCI_SIGNED_DOCUMENTS_START_REQUEST"
)<void>();

/**
 * start the FCI signed end action
 */
export const fciShowSignedDocumentsEndRequest = createStandardAction(
  "FCI_SIGNED_DOCUMENTS_END_REQUEST"
)<void>();

/**
 * clear the FCI store
 */
export const fciEndRequest = createStandardAction("FCI_END_REQUEST")<void>();

export const fciPollFilledDocument = createAsyncAction(
  "POLL_FILLED_DOCUMENT_REQUEST",
  "POLL_FILLED_DOCUMENT_SUCCESS",
  "POLL_FILLED_DOCUMENT_FAILURE"
)<void, { isReady: boolean }, NetworkError>();

export const fciCancelPollingFilledDocument = createStandardAction(
  "POLL_FILLED_DOCUMENT_CANCEL"
)<void>();

export const fciMetadataRequest = createAsyncAction(
  "FCI_METADATA_REQUEST",
  "FCI_METADATA_SUCCESS",
  "FCI_METADATA_FAILURE"
)<void, Metadata, NetworkError>();

export type FciActions =
  | ActionType<typeof fciSignatureRequestFromId>
  | ActionType<typeof fciLoadQtspClauses>
  | ActionType<typeof fciLoadQtspFilledDocument>
  | ActionType<typeof fciSigningRequest>
  | ActionType<typeof fciClearStateRequest>
  | ActionType<typeof fciStartRequest>
  | ActionType<typeof fciUpdateDocumentSignaturesRequest>
  | ActionType<typeof fciStartSigningRequest>
  | ActionType<typeof fciEndRequest>
  | ActionType<typeof fciDownloadPreview>
  | ActionType<typeof fciDownloadPreviewClear>
  | ActionType<typeof fciShowSignedDocumentsStartRequest>
  | ActionType<typeof fciShowSignedDocumentsEndRequest>
  | ActionType<typeof fciPollFilledDocument>
  | ActionType<typeof fciCancelPollingFilledDocument>
  | ActionType<typeof fciMetadataRequest>;
