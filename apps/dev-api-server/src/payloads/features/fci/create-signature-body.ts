import { CreateSignatureBody } from "../../../../generated/definitions/fci/CreateSignatureBody";
import { DocumentToSign } from "../../../../generated/definitions/fci/DocumentToSign";
import { QtspClauses } from "../../../../generated/definitions/fci/QtspClauses";
import { qtspClauses } from "./qtsp-clauses";
import { qtspFilledDocument } from "./qtsp-filled-document";
import { documents, SIGNATURE_REQUEST_ID } from "./signature-request";

const documentSignatures: ReadonlyArray<DocumentToSign> = [
  {
    document_id: documents[0].id,
    signature_fields: documents[0].metadata.signature_fields
  },
  {
    document_id: documents[1].id,
    signature_fields: documents[1].metadata.signature_fields
  },
  {
    document_id: documents[2].id,
    signature_fields: documents[2].metadata.signature_fields
  },
  {
    document_id: documents[3].id,
    signature_fields: documents[3].metadata.signature_fields
  },
  {
    document_id: documents[4].id,
    signature_fields: documents[4].metadata.signature_fields
  }
];

export const createSignatureBody: CreateSignatureBody = {
  signature_request_id: SIGNATURE_REQUEST_ID,
  documents_to_sign: documentSignatures,
  qtsp_clauses: {
    accepted_clauses: qtspClauses.clauses,
    filled_document_url: qtspFilledDocument.filled_document_url,
    nonce: "mockedNonceBase64"
  } as QtspClauses
};
