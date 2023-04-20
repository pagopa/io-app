import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { CreateSignatureBody } from "../../../../../definitions/fci/CreateSignatureBody";
import { QtspClauses } from "../../../../../definitions/fci/QtspClauses";
import { mockQtspClausesMetadata } from "./QtspClausesMetadata.mock";

export const mockCreateSignatureBody: CreateSignatureBody = {
  signature_request_id: "mockSignatureRequestId" as NonEmptyString,
  documents_to_sign: [],
  qtsp_clauses: {
    nonce: "mockedBase64Nonce" as NonEmptyString,
    accepted_clauses: mockQtspClausesMetadata.clauses,
    filled_document_url: "https://fakedFilledDocumentUrl" as NonEmptyString
  } as QtspClauses
};
