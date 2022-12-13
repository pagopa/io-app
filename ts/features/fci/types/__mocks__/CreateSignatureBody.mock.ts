import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { CreateSignatureBody } from "../../../../../definitions/fci/CreateSignatureBody";
import { QtspClauses } from "../../../../../definitions/fci/QtspClauses";
import { mockQtspClausesMetadata } from "./QtspClausesMetadata.mock";

export const mockCreateSignatureBody: CreateSignatureBody = {
  signature_request_id: "mockSignatureRequestId",
  document_signatures: [],
  public_key_digest: "" as NonEmptyString,
  qtsp_clauses: {
    nonce: "",
    accepted_clauses: mockQtspClausesMetadata.clauses,
    filled_document_url: "",
    signature: "",
    tos_signature_timestamp: new Date()
  } as QtspClauses
};
