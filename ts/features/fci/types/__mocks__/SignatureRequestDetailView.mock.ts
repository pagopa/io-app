import {
  SignatureRequestDetailView,
  StatusEnum as SignatureRequestStatus
} from "../../../../../definitions/fci/SignatureRequestDetailView";

const now = new Date();

export const mockSignatureRequestDetailView: SignatureRequestDetailView = {
  id: "mockId",
  status: SignatureRequestStatus.WAIT_FOR_SIGNATURE,
  expires_at: new Date(now.setDate(now.getDate() + 30)),
  created_at: now,
  dossier_id: "mockDossierId",
  qr_code_url: "mockQrCodeUrl",
  signer_id: "mockSignerId",
  updated_at: now,
  documents: []
};
