import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { StatusEnum as DocumentStatusEnum } from "../../../../../definitions/fci/Document";
import { DocumentDetailView } from "../../../../../definitions/fci/DocumentDetailView";
import {
  SignatureRequestDetailView,
  StatusEnum as SignatureRequestStatus
} from "../../../../../definitions/fci/SignatureRequestDetailView";

const now = new Date();

export const mockDocuments: ReadonlyArray<DocumentDetailView> = [
  {
    id: "1" as NonEmptyString,
    created_at: new Date(),
    url: `http://127.0.0.1:3000/static_content/fci/modulo_1` as NonEmptyString,
    updated_at: new Date(),
    uploaded_at: new Date(),
    status: DocumentStatusEnum.READY,
    metadata: {}
  }
];

export const mockSignatureRequestDetailView: SignatureRequestDetailView = {
  id: "mockId",
  status: SignatureRequestStatus.WAIT_FOR_SIGNATURE,
  expires_at: new Date(now.setDate(now.getDate() + 30)),
  created_at: now,
  dossier_id: "mockDossierId",
  qr_code_url: "mockQrCodeUrl",
  signer_id: "mockSignerId",
  updated_at: now,
  documents: mockDocuments
};
