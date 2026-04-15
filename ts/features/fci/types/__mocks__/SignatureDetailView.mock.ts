import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import {
  SignatureDetailView,
  StatusEnum as SignatureRequestStatus
} from "../../../../../definitions/fci/SignatureDetailView";

const now = new Date();

export const mockSignatureDetailView: SignatureDetailView = {
  id: "mockId" as NonEmptyString,
  signature_request_id: "mockSignatureRequestId" as NonEmptyString,
  qtsp_signature_request_id: "mockQtspSignatureRequestId" as NonEmptyString,
  status: SignatureRequestStatus.COMPLETED,
  created_at: now,
  updated_at: now
};
