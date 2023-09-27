import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { CreateSignatureBody } from "../../../../../definitions/fci/CreateSignatureBody";
import { QtspClauses } from "../../../../../definitions/fci/QtspClauses";
import { DocumentToSign } from "../../../../../definitions/fci/DocumentToSign";
import { mockQtspClausesMetadata } from "./QtspClausesMetadata.mock";
import { mockDocuments } from "./SignatureRequestDetailView.mock";

const documentsToSign: ReadonlyArray<DocumentToSign> = [
  {
    document_id: mockDocuments[0].id,
    signature_fields: mockDocuments[0].metadata.signature_fields
  },
  {
    document_id: mockDocuments[1].id,
    signature_fields: mockDocuments[1].metadata.signature_fields
  },
  {
    document_id: mockDocuments[2].id,
    signature_fields: mockDocuments[2].metadata.signature_fields
  }
];

export const mockCreateSignatureBody: CreateSignatureBody = {
  signature_request_id: "mockSignatureRequestId" as NonEmptyString,
  documents_to_sign: documentsToSign,
  qtsp_clauses: {
    nonce: "mockedBase64Nonce" as NonEmptyString,
    accepted_clauses: mockQtspClausesMetadata.clauses,
    filled_document_url: "https://fakedFilledDocumentUrl" as NonEmptyString
  } as QtspClauses
};
